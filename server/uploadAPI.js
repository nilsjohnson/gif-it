const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const { app, http, https, serveMode } = require('./server');
const { ServeModes, FilePaths, MAX_UPLOAD_SIZE } = require('./const');
const bodyParser = require('body-parser');
const { addGif } = require('./dataAccess');
const { getUniqueID, checkUnique } = require("./fileUtil");
const { convertToGif } = require('./util/ffmpegWrapper');

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
  if(delete sockets[socketId]) {
    console.log(`Socket ${socketId} has been deleted`);
  } else {
    console.log(`Problem deleting ${socketId}.`);
  }
}


function sendConversionProgress(socketId, uploadId, data) {
  sockets[socketId].emit("ConversionProgress", {uploadId: uploadId, conversionData: data});
}

function finishConversion(socketId, uploadId) {
  sockets[socketId].emit("ConversionComplete", { uploadId: uploadId, servePath: uploadId + '.gif' });
}

/**
 * adds a socket to sockets and defines its listeners
 */
function addSocket(newSocket) {
  let socketId = newSocket.id;
  sockets[socketId] = newSocket; 

  if(DEBUG) {
    let numSockets = Object.keys(sockets).length;
    console.log(`There ${numSockets > 1 ? "are" : "is"} ${numSockets} socket${numSockets > 1 ? "s" : ""} open right now.`);
  }

  sockets[socketId].on("disconnect", () => {
    console.log(`Socket ${socketId} disconnected`);
    deleteSocket(socketId);
  });

  sockets[socketId].on("ConvertRequested", (uploadId) => {
    console.log(`Client using socket ${socketId} requesting uploadId ${uploadId} to be converted.`);
    convertToGif(uploadMap[uploadId].uploadDst,
                path.join(FilePaths.GIF_SERVE_DIR, uploadId + ".gif"), 
                socketId, 
                uploadId, 
                null, 
                sendConversionProgress, 
                finishConversion);
  });

  sockets[socketId].on("ShareRequest", (data) => {
    console.log("data:");
    console.log(data);
    let ipAddr = uploadMap[data.fileId].ipAddr;
    let originalFileName = uploadMap[data.fileId].originalFileName;
    let tags = data.tags.split(" ");
    addGif(data.fileId, data.fileId + ".gif", tags, ipAddr, originalFileName);
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
  if(DEBUG) {console.log(`video upload hit by socket ${req.params.socketId}.`);}
 
  let socketId = req.params.socketId;
  let busboy = new Busboy({ headers: req.headers });
  let bytesRecieved = 0;
  let fileSize = req.headers["content-length"];
  let uploadDst;
  let fileName;
  let uploadId = getUniqueID();
  let ipAddr = req.ip;

  // validaion here..
  if(fileSize/ (1000*1000).toFixed(2) > MAX_UPLOAD_SIZE) {
    if(DEBUG) { 
      console.log(`Chosen file is ${fileSize/ (1000*1000).toFixed(2)} MB, while ${MAX_UPLOAD_SIZE} MB is the maximum. Returning 400..`)
    };
    res.status(400);
    res.send({err: `File Too Large. Max Size: ${MAX_UPLOAD_SIZE} Mb.`});
    res.end();
    return;
  }

  busboy.on('file', function (fieldName, file, givenFileName, encoding, mimetype) {
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
      uploadId: uploadId
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
});

