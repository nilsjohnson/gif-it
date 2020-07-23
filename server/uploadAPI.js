const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const { app, http, https, serveMode } = require('./server');
const { ServeModes, FilePaths, MAX_UPLOAD_SIZE } = require('./const');
const bodyParser = require('body-parser');
const { addGif } = require('./dataAccess');
const { getUniqueID, checkUnique } = require("./fileUtil");
const { convertToGif } = require('./util/ffmpegWrapper');
const { splitTags } = require('./util/util');

app.use(bodyParser.json());
const io = (serveMode === ServeModes.DEV ? require('socket.io')(http) : require('socket.io').listen(https));


/**
 * Maps an uploadId to an object holding the originalFileName, uploadDst, and ipAddr
 */
let uploadMap = {};
/**
 * Holds open sockets - { socketId : socket}
 */
let sockets = {};

/**
 * deletes a socket by its id;
 */
function deleteSocket(socketId) {
  if (delete sockets[socketId]) {
    console.log(`Socket ${socketId} has been deleted`);
  } else {
    console.log(`Problem deleting ${socketId}.`);
  }
}


function sendConversionProgress(socketId, data) {
  sockets[socketId].emit("ConversionProgress", data);
}

//onClose(socketId, uploadId, `${uploadId}.gif`, `${uploadId}.thumb.gif`);
function finishConversion(socketId, uploadId, fileName, thumbFileName) {
  uploadMap[uploadId].fileName = fileName;
  uploadMap[uploadId].thumbFileName = thumbFileName
  sockets[socketId].emit("ConversionComplete", { uploadId: uploadId, servePath: fileName });
}



/**
 * adds a socket to sockets and defines its listeners
 */
function addSocket(newSocket) {
  let socketId = newSocket.id;
  sockets[socketId] = newSocket;

  if (DEBUG) {
    let numSockets = Object.keys(sockets).length;
    console.log(`There ${numSockets > 1 ? "are" : "is"} ${numSockets} socket${numSockets > 1 ? "s" : ""} open right now.`);
  }

  sockets[socketId].on("disconnect", () => {
    console.log(`Socket ${socketId} disconnected`);
    deleteSocket(socketId);
  });

  sockets[socketId].on("ConvertRequested", (data) => {
    const { uploadId, quality } = data;
    console.log(`Client using socket ${socketId} requesting uploadId ${uploadId} to be converted.`);
    convertToGif(uploadMap[uploadId].uploadDst,
      path.join(FilePaths.GIF_SERVE_DIR, uploadId + ".gif"),
      socketId,
      uploadId,
      quality,
      null,
      sendConversionProgress,
      finishConversion);
  });

  sockets[socketId].on("ShareRequest", (data) => {
    console.log("data:");
    console.log(data);
    console.log(uploadMap);
    const { uploadId, tags, description } = data;

    if (!tags) {
      sockets[socketId].emit("ShareResult", { uploadId: uploadId, message: "Please Provide a Tag." })
      return;
    }

    let ipAddr = uploadMap[uploadId].ipAddr;
    let originalFileName = uploadMap[uploadId].originalFileName;
    let fileName = uploadMap[uploadId].fileName;
    let thumbFileName = uploadMap[uploadId].thumbFileName;
    let tagArr = splitTags(tags);

    addGif(uploadId,
      fileName,
      thumbFileName,
      tagArr,
      description,
      ipAddr,
      originalFileName
    ).then((result) => {
      console.log(result);
      sockets[socketId].emit("ShareResult", { uploadId: uploadId, message: "Thank You!" })
    }).catch(err => {
      sockets[socketId].emit("ShareResult", { uploadId: uploadId, message: err.toString() })
    });
  });
}

/**
 * on connection handler. Defines actions for each socket as it connects.
 */
io.on("connection", (newSocket) => {
  addSocket(newSocket);
});

/**
 * This API handles a file upload and then coverts it to GIF
 */
app.post('/api/videoUpload/:socketId', function (req, res) {
  if (DEBUG) { console.log(`video upload hit by socket ${req.params.socketId}.`); }

  let socketId = req.params.socketId;
  let bytesRecieved = 0;
  let fileSize = req.headers["content-length"];
  let uploadDst;
  let fileName;
  let uploadId = getUniqueID();
  let ipAddr = req.ip;

  // validaion size
  if (fileSize / (1000 * 1000).toFixed(2) > MAX_UPLOAD_SIZE ) {
    if (DEBUG) { console.log(`Chosen file is ${fileSize / (1000 * 1000).toFixed(2)} MB, while ${MAX_UPLOAD_SIZE} MB is the maximum. Returning 400..`) };
    res.status(400).send({ error: `File Too Large. Max Size: ${MAX_UPLOAD_SIZE} Mb.` });
  }
  else {
    let busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function (fieldName, file, givenFileName, encoding, mimetype) {
      if (!mimetype.startsWith('video')) {
        console.log(givenFileName + " is invalid");
        res.status(400);
        res.json({ error: `${givenFileName}: Unsupported Format` });
        return;
      }
      // set the fileName
      fileName = checkUnique(givenFileName);
      // set the upload dst
      uploadDst = path.join(FilePaths.UPLOAD_DIR + "/" + fileName);
      // map this uploadId to this file and fileName
      uploadMap[uploadId] = {};
      uploadMap[uploadId].uploadDst = uploadDst;
      uploadMap[uploadId].originalFileName = givenFileName;
      uploadMap[uploadId].ipAddr = ipAddr;
      // signal to client that we are starting the upload shortly
      sockets[socketId].emit("UploadStart", {
        uploadId: uploadId,
        fileName: givenFileName
      });

      file.on('data', function (data) {
        bytesRecieved = bytesRecieved + data.length;
        // sockets[socketId].emit("FromAPI", Math.round(bytesRecieved * 100 / fileSize) + '% Uploaded');
        let percentUploaded = Math.round(bytesRecieved * 100 / fileSize);
        sockets[socketId].emit("UploadProgress", {
          uploadId: uploadId,
          percentUploaded: percentUploaded,
        });
      });

      file.pipe(fs.createWriteStream(uploadDst));
    });

    busboy.on('finish', function () {
      sockets[socketId].emit("uploadComplete", {
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

