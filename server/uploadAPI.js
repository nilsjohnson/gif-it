/*
This API works as follows.

(1) the client opens a socket.
(2) the server accepts and adds that socket to 'connections' object.
(3) the client then proceeds to upload files. 
      - When client hits '/api/videoUpload/:socketId/:tempUploadId' to start the upload,
        we respond using their socket to give them their offical upload id.
      - Then, as the upload procedes, we use that that id to return the upload progress.
(4) When the upload is done, we emit 'uploadComplete'
(5) We then wait for 'ConvertRequested'. Once recieved, we covnert.
(6) We then wait for 'ShareRequest'. Once recieved, we put the infromation in the DB.

If at any point we cannot find an upload or socket in the 'connections' object, we emit a 'retry' request.

*/

const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const { app, http } = require('./server');
const { FilePaths, MAX_UPLOAD_SIZE } = require('./const');
const { addGif, getSuggestedTags } = require('./util/dataAccess');
const { getUniqueID, checkUnique } = require("./util/fileUtil");
const { addJob } = require('./util/ffmpegWrapper');
const { processTags, transferGifToS3, deleteFromS3 } = require('./util/util');
const { connect } = require('http2');

let io = require('socket.io')(http) 

if(DEV) {
  io.set('origins', 'http://localhost:3000'); 
}
else {
  io.set('origins', 'https://gif-it.io:*')
}


/**
 * Holds open connections - { socketId_1 : { socket: socket, uploads: {} }, socketId_2 : .... }
 */
let connections = {};

/**
 * deletes a socket by its id;
 */
function deleteSocket(socketId) {
  deleteUnsharedGifs(socketId);

  if (delete connections[socketId]) {
    if (DEBUG) { console.log(`Socket ${socketId} has been deleted`); }
  } else {
    console.log(`Problem deleting ${socketId}.`);
  }

  if (DEBUG) {
    console.log(`Here are the current connections.`);
    console.log(connections);
  }
}

/**
 * Deletes an uploaded object if the users opted to not share it.
 * @param {*} socketId 
 */
function deleteUnsharedGifs(socketId) {
  if (connections[socketId] && connections[socketId].uploads) {
    let uploadIds = Object.keys(connections[socketId].uploads);

    for (let i = 0; i < uploadIds.length; i++) {
      if (!connections[socketId].uploads[uploadIds[i]].shared) {
        deleteFromS3(`${uploadIds[i]}.gif`);
      }
    }
  }
}

/**
 * Sends progress reports to the client of how their conversion is going. i.e - speed, progress, etc.
 * @param {*} socketId 
 * @param {*} data 
 */
function sendConversionProgress(socketId, data) {
  //if (DEBUG) { console.log('sendConversionProgress: '); console.log(data); }
  connections[socketId].socket.emit("ConversionProgress", data);
}

/**
 * Callback for successfully making a gif
 * @param {*} socketId  The socketId of the man or woman who made this gif
 * @param {*} uploadId  The uploadId
 * @param {*} fileName  The fileName of the gif
 * @param {*} thumbFileName   The (tentative) thumbnail file's name
 */
function onGifMade(socketId, uploadId, fileName, thumbFileName) {
  connections[socketId].uploads[uploadId].fileName = fileName;
  connections[socketId].uploads[uploadId].thumbFileName = thumbFileName

  if (DEBUG) {
    console.log(`onGifMade called - 
    socketId: ${socketId}, 
    uploadId:${uploadId}, 
    fileName:${fileName}, 
    thumbFileName: ${thumbFileName}`);
  }

  // if running production, send to s3
  if (!DEV) {
    transferGifToS3(path.join(FilePaths.GIF_SAVE_DIR, fileName),
      (data) => { // on success
        connections[socketId].socket.emit("ConversionComplete", { uploadId: uploadId, servePath: fileName });
        if (DEBUG) { console.log(`s3 transfer sucess! - ${data}`); }
      },
      (err) => { // on failure
        connections[socketId].socket.emit("ConversionComplete", { uploadId: uploadId, error: "Something Went Wrong. Sorry! :(" });
        console.log(`Problem Uploading to s3. ${err}`);
      });
  }
  // otherwise we are in DEV mode so we just serve it from where we saved it.
  else {
    connections[socketId].socket.emit("ConversionComplete", { uploadId: uploadId, servePath: fileName });
  }
}

/**
 * Transfers thumbnail to s3
 * 
 * @param {*} thumbName 
 */
function onThumbMade(thumbName) {
  if (DEBUG) { console.log(`onThumbMade called - thumbName: ${thumbName}`); }

  if (!DEV) {
    transferGifToS3(path.join(FilePaths.GIF_SAVE_DIR, thumbName),
      (data) => { // if success
        if (DEBUG) { console.log(`Thumbnail s3 transfer success: ${data}`); }
      }),
      (err) => { // if failure
        console.log(`Thumbnail s3 transfer failed: ${err}`);
      };
  }
  else {
    // Do nothing. The thumbnail should be sitting in the serve directory 
    // ready to go. See see 'const.js' for that location. 
  }
}

/**
 * adds a socket to sockets and defines its listeners
 */
function addSocket(newSocket) {
  let socketId = newSocket.id;
  connections[socketId] = { socket: newSocket, uploads: {} };

  if (DEBUG) {
    let numSockets = Object.keys(connections).length;
    console.log(`There ${numSockets > 1 ? "are" : "is"} ${numSockets} socket${numSockets > 1 ? "s" : ""} open right now.`);
  }

  connections[socketId].socket.on("disconnect", () => {
    console.log(`Socket ${socketId} disconnected`);
    deleteSocket(socketId);
  });

  connections[socketId].socket.on("ConvertRequested", (data) => {
    const { uploadId, quality } = data;
    console.log(`Client using socket ${socketId} requesting uploadId ${uploadId} to be converted.`);

    // if there is a destination for this, and an upload id
    if (connections[socketId].uploads[uploadId] && uploadId) {
      addJob(connections[socketId].uploads[uploadId].uploadDst,
        path.join(FilePaths.GIF_SAVE_DIR, uploadId + ".gif"),
        socketId,
        uploadId,
        quality,
        null,
        sendConversionProgress,
        onGifMade,
        onThumbMade);
    }
    else {
      console.log(`Couldnt convert upload ${uploadId} on socket ${socketId} to .gif`);
      sendRetryRequest(socketId, uploadId);
    }
  });

  connections[socketId].socket.on("ShareRequest", (data) => {
    if (DEBUG) { console.log(`ShareRequest - `); console.log(data); }

    const { uploadId, tags, description } = data;
    let processedTags;

    if (!connections[socketId].uploads[uploadId]) {
      console.log(`Upload ${uploadId} not found. Sending retry request.`);
      sendRetryRequest(socketId, uploadId);
      return;
    }

    try {
      processedTags = processTags(tags);
    }
    catch (err) {
      connections[socketId].socket.emit("ShareResult", { uploadId: uploadId, error: err })
      return;
    }

    if (DEBUG) {
      console.log("processed tags:");
      console.log(processedTags);
    }

    let ipAddr = connections[socketId].uploads[uploadId].ipAddr;
    let originalFileName = connections[socketId].uploads[uploadId].originalFileName;
    let fileName = connections[socketId].uploads[uploadId].fileName;
    let thumbFileName = connections[socketId].uploads[uploadId].thumbFileName;

    addGif(uploadId,
      fileName,
      thumbFileName,
      processedTags,
      description,
      ipAddr,
      originalFileName
    ).then((result) => {
      console.log(result);
      connections[socketId].socket.emit("ShareResult", { uploadId: uploadId, status: "shared" });
      connections[socketId].uploads[uploadId].shared = true;
    }).catch(err => {
      connections[socketId].socket.emit("ShareResult", { uploadId: uploadId, error: err.toString() })
    });
  });

  connections[socketId].socket.on("SuggestTags", (data) => {
    if (DEBUG) { console.log(`SuggestTags: `); console.log(data); }

    const { uploadId, input } = data;

    getSuggestedTags(input, (results) => {
      if (results) {
        connections[socketId].socket.emit("SuggestionsFound", {
          uploadId: uploadId,
          tags: results
        });
      }
    });
  });
}



function sendRetryRequest(socketId, uploadId) {
  connections[socketId].socket.emit("retry", { uploadId: uploadId });
}

/**
 * on connection handler. Defines actions for each socket as it connects.
 */
io.on("connection", (newSocket) => {
  if (DEBUG) { console.log(`New socket connected, id: ${newSocket.id}`) }
  addSocket(newSocket);
});

/**
 * This API handles a file upload and then coverts it to GIF
 */
app.post('/api/videoUpload/:socketId/:tempUploadId', function (req, res) {
  if (DEBUG) { console.log(`video upload hit by socket ${req.params.socketId}.`); }

  let socketId = req.params.socketId;
  let tempUploadId = req.params.tempUploadId;
  let bytesRecieved = 0;
  let fileSize = req.headers["content-length"];
  let uploadDst;
  let fileName;
  let uploadId = getUniqueID();
  let ipAddr = req.ip;

  // validaion size
  if (fileSize / (1000 * 1000).toFixed(2) > MAX_UPLOAD_SIZE) {
    if (DEBUG) { console.log(`Chosen file is ${fileSize / (1000 * 1000).toFixed(2)} MB, while ${MAX_UPLOAD_SIZE} MB is the maximum. Returning 400..`) };
    res.status(400).send({ error: `File Too Large. Max Size: ${MAX_UPLOAD_SIZE} Mb.` });
  }
  else if (!connections[socketId]) {
    if (DEBUG) { console.log(`${socketId} not found.`) };
    res.status(400).send({ error: `Socket ${socketId} not found.` });
  }
  else {
    let busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function (fieldName, file, givenFileName, encoding, mimetype) {
      if (!mimetype.startsWith('video')) {
        if (DEBUG) { console.log(`${givenFileName} has invalid mimetype. ${mimetype} privided, but 'video/*' is required.`); }
        res.status(400);
        res.json({ error: `${givenFileName}: Unsupported Format` });
        return;
      }
      // set the fileName
      fileName = checkUnique(givenFileName);
      // set the upload dst
      uploadDst = path.join(FilePaths.UPLOAD_DIR + "/" + fileName);
      // map this socket to this upload
      try {
        console.log(`uploadId: ${uploadId}`);
        addUpload(uploadId, uploadDst, givenFileName, ipAddr, socketId);
      }
      catch (err) {
        console.log("errr");
        console.log(err);
        res.status(400).send({ error: err });
        return;
      }


      // signal to client that we are starting the upload shortly
      connections[socketId].socket.emit("UploadStart", {
        uploadId: uploadId,
        tempUploadId: tempUploadId
      });

      file.on('data', function (data) {
        bytesRecieved = bytesRecieved + data.length;
        let percentUploaded = Math.round(bytesRecieved * 100 / fileSize);
        //if(DEBUG) { console.log(`upload progress: ${percentUploaded}% for uploadId ${uploadId}`); }
        if(connections[socket]) {
          connections[socketId].socket.emit("UploadProgress", {
            uploadId: uploadId,
            percentUploaded: percentUploaded,
          });
        }
      });

      file.pipe(fs.createWriteStream(uploadDst));
    });

    busboy.on('finish', function () {
      connections[socketId].socket.emit("uploadComplete", {
        videoLength: null,
        uploadFinishTime: new Date(),
        uploadId: uploadId
      });

      // finish was called so upload was success.
      res.writeHead(200, { 'Connection': 'close' });
      res.end();
    });

    return req.pipe(busboy);
  }
});

function addUpload(uploadId, uploadDst, givenFileName, ipAddr, socketId) {
  if (connections[socketId]) {
    connections[socketId].uploads[uploadId] = {};
    connections[socketId].uploads[uploadId].uploadDst = uploadDst;
    connections[socketId].uploads[uploadId].originalFileName = givenFileName;
    connections[socketId].uploads[uploadId].ipAddr = ipAddr;
    connections[socketId].uploads[uploadId].socketId = socketId;

  }
  else {
    throw (`Socket id ${socketId} was not found`);
  }
}
