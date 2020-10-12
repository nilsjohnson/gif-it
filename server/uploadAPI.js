/*
This API works as follows.

(1) the client opens a socket.
(2) the server accepts and adds that socket to 'connections' object.
(3) the client then proceeds to upload files. 
      - When client hits '/upload/:socketId/:tempUploadId/:action' to start the upload,
        we respond using their socket to give them their offical upload id.
      - Then, as the upload procedes, we use that that id to return the upload progress.
(4) When the upload is done, we emit 'uploadComplete'
(5) We then transfer the connection and upload to the approriate API to handle the rest.
*/

const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const { app, http } = require('./server');
const { FilePaths, MAX_UPLOAD_SIZE } = require('./const');
const { getUniqueID, checkUnique } = require("./util/fileUtil");
const AuthDAO = require('./data/AuthDAO');
const MediaDAO = require('./data/MediaDAO');
const { addJob } = require('./mediaUtil/gifMaker');
let io = require('socket.io')(http);
const { transferGifToS3, deleteFromS3 } = require('./util/util');
const log = require('./util/logger');

io.set('origins', DEV ? 'http://localhost:3000' : 'https://gif-it.io:*');
let authDAO = new AuthDAO();
let mediaDAO = new MediaDAO();

/**
 * Holds open connections - { socketId_1 : { socket: socket, uploads: {} }, socketId_2 : .... }
 */
let connections = {};

/**
 * Deletes an uploaded object if the users opted to not share it.
 * @param {*} socketId 
 */
function deleteUnsharedGifs(socketId) {
  if (connections[socketId] && connections[socketId].uploads) {
    let uploadIds = Object.keys(connections[socketId].uploads);

    for (let i = 0; i < uploadIds.length; i++) {
      if (!connections[socketId].uploads[uploadIds[i]].shared) {
        deleteFromS3(`${uploadIds[i]}.gif`, null, (err) => {
          log(err);
        });
        deleteFromS3(`${uploadIds[i]}.thumb.gif`, null, (err) => {
          log(err);
        });
        
      }
    }
  }
}


/**
 * Callback for successfully making a gif
 * @param {*} socketId  The socketId of the user who made this gif
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

  // send to s3
  transferGifToS3(path.join(FilePaths.GIF_SAVE_DIR, fileName),
    (data) => {
      // on success
      connections[socketId].socket.emit("ConversionComplete", {
        uploadId: uploadId,
        fileName: fileName,
        thumbName: thumbFileName
      });
      if (DEBUG) { console.log(`s3 transfer sucess! - ${data}`); }
    },
    (err) => {
      // on failure
      connections[socketId].socket.emit("ConversionComplete", { uploadId: uploadId, error: "Something Went Wrong. Sorry! :(" });
      console.log(`Problem Uploading to s3. ${err}`);
    });
}

/**
 * Transfers thumbnail to s3
 * 
 * @param {*} thumbName 
 */
function onThumbMade(thumbName) {
  if (DEBUG) { console.log(`onThumbMade called - thumbName: ${thumbName}`); }

  transferGifToS3(path.join(FilePaths.GIF_SAVE_DIR, thumbName),
    (data) => {
      // if success
      if (DEBUG) { console.log(`Thumbnail s3 transfer success: ${data}`); }
    }),
    (err) => {
      // if failure
      console.log(`Thumbnail s3 transfer failed: ${err}`);
    };
}

/** 
 * Signals the client to retry the upload.
 * Use if an upload isn't found.
 */
function sendRetryRequest(socketId, uploadId) {
  connections[socketId].socket.emit("retry", { uploadId: uploadId });
}

/**
 * deletes a socket by its id;
 */
function deleteSocket(socketId) {
  deleteUnsharedGifs(socketId);
  return delete connections[socketId];
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
    if(deleteSocket(socketId)) {
      console.log(`Socket ${socketId} deleted and disconnected`);
    }
    else {
      log(`Socket ${socketId} disconnected, but an error occured deleteing it.`);
    }
  });

  connections[socketId].socket.on("SuggestTags", (data) => {
    if (DEBUG) { console.log(`SuggestTags: `); console.log(data); }

    const { uploadId, input } = data;

    mediaDAO.getSuggestedTags(input, (results) => {
      if (results) {
        connections[socketId].socket.emit("SuggestionsFound", {
          uploadId: uploadId,
          tags: results
        });
      }
    });
  });

  // when the client requests this be converted to gif
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

  // so this gif isnt deleted after the user shares it
  connections[socketId].socket.on("MarkShared", data => {
    const { uploadId } = data;
    console.log(`Marking as shared: ${uploadId}`);

    if(connections[socketId].uploads[uploadId]) {
      connections[socketId].uploads[uploadId].shared = true;
      console.log("marked as shared.");
    }
    else {
      log("Tried to mark a gif as shared, but it wasn't found");
    }
    
  });
}

/**
 * on connection handler. Defines actions for each socket as it connects.
 */
io.on("connection", (newSocket) => {
  if (DEBUG) { console.log(`New socket connected, id: ${newSocket.id}`) }
  addSocket(newSocket);
});

/**
 * Sends progress reports to the client of how their conversion is going. i.e - speed, progress, etc.
 * @param {*} socketId 
 * @param {*} data 
 */
function sendConversionProgress(socketId, data) {
  if (DEBUG) { console.log('sendConversionProgress: '); console.log(data); }
  connections[socketId].socket.emit("ConversionProgress", data);
}

/**
 * This API handles a file upload and then coverts it to GIF
 */
app.post('/upload/:socketId/:tempUploadId/:action', function (req, res) {
  if (DEBUG) { console.log(`video upload hit by socket ${req.params.socketId}.`); }

  let userId = authDAO.authenticate(req.headers);
  if (!userId) {
    console.log("Sending Redirect.");
    res.redirect('/login');
    return;
  }

  let socketId = req.params.socketId;
  let tempUploadId = req.params.tempUploadId;
  let action = req.params.action;
  let percentUploaded = 0;
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
    return;
  }
  else if (!connections[socketId]) {
    if (DEBUG) { console.log(`${socketId} not found.`) };
    res.status(400).send({ error: `Socket ${socketId} not found.` });
    return;
  }
  else {
    let busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function (fieldName, file, givenFileName, encoding, mimetype) {
      // set the fileName
      fileName = checkUnique(givenFileName, FilePaths.UPLOAD_DIR);
      // set the upload dst
      uploadDst = path.join(FilePaths.UPLOAD_DIR + "/" + fileName);
      // map this socket to this upload
      try {
        addUpload(uploadId, uploadDst, givenFileName, ipAddr, socketId, userId, action);
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
        let newPercentUploaded = Math.round(bytesRecieved * 100 / fileSize);
        if (DEBUG) { console.log(`upload progress: ${percentUploaded}% for uploadId ${uploadId}`); }
        if (connections[socketId] && connections[socketId].socket) {
          // only send new value if its greater than before to avoid sending like '2%...2%...3%...'
          if (newPercentUploaded > percentUploaded) {
            connections[socketId].socket.emit("UploadProgress", {
              uploadId: uploadId,
              percentUploaded: newPercentUploaded,
            });
          }
          percentUploaded = newPercentUploaded;
        }
        else {
          console.log(`No socket to send upload progress to for socket ${socketId}`);
        }
      });

      file.pipe(fs.createWriteStream(uploadDst));
    });

    busboy.on('finish', function () {
      connections[socketId].socket.emit("uploadComplete", {
        uploadId: uploadId
      });

      // finish was called so upload was success.
      res.writeHead(200, { 'Connection': 'close' });
      res.end();
    });

    return req.pipe(busboy);
  }
});

app.post('/upload/addMedia', function (req, res) {
  let userId = authDAO.authenticate(req.headers);
  if (!userId) {
    console.log("Sending Redirect.");
    res.redirect('/login');
    return;
  }

  console.log("bod");
  console.log(req.body);

  if(req.body.album) {
    // if this is an 'album' of items
    let album = req.body.album;

    mediaDAO.createAlbum(album, userId, req.ip, (albumId) => {
      // on success
      console.log("Album created!");
      res.send({redirect: `/explore?albumId=${albumId}`});
    }, err => {
      // on error
      console.log(err);
      res.sendStatus(500);
    });
  }
  else if(req.body.media) {
    // if this is just a single item
    let media = req.body.media;
    mediaDAO.addMedia(media, userId, req.ip, mediaId => {
      // on success
      res.send({redirect: `/explore?mId=${mediaId}`});
    }, err => {
      // on error
      console.log(err);
      res.sendStatus(500);
    });
  }

});


function addUpload(uploadId, uploadDst, givenFileName, ipAddr, socketId, userId, action) {
  if (connections[socketId]) {
    connections[socketId].uploads[uploadId] = {
      uploadDst: uploadDst,
      originalFileName: givenFileName,
      ipAddr: ipAddr,
      socketId: socketId,
      userId: userId,
      action: action
    };

  }
  else {
    throw (`Socket id ${socketId} was not found`);
  }
}
