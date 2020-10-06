const path = require('path');
const { http } = require('./server');
const { FilePaths } = require('./const');
const { addJob } = require('./mediaUtil/gifMaker');
const { transferGifToS3, deleteFromS3 } = require('./util/util');
const log = require('./util/logger');
let io = require('socket.io')(http)

io.set('origins', DEV ? 'http://localhost:3000' : 'https://gif-it.io:*');

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
  } 
  else {
    console.log(`Problem deleting ${socketId}.`);
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
 * Sends progress reports to the client of how their conversion is going. i.e - speed, progress, etc.
 * @param {*} socketId 
 * @param {*} data 
 */
function sendConversionProgress(socketId, data) {
  if (DEBUG) { console.log('sendConversionProgress: '); console.log(data); }
  connections[socketId].socket.emit("ConversionProgress", data);
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
 * defines new listeners for this socket
 */
function addEventHandlers(newSocket, socketId) {
  // when the socket is disconnected
  newSocket.on("disconnect", () => {
    console.log(`Socket ${socketId} disconnected`);
    deleteSocket(socketId);
  });

  // when the client requests this be converted to gif
  newSocket.on("ConvertRequested", (data) => {
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
  newSocket.on("MarkShared", data => {
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
 * Signals the client to retry the upload.
 * Use if an upload isn't found.
 */
function sendRetryRequest(socketId, uploadId) {
  connections[socketId].socket.emit("retry", { uploadId: uploadId });
}

/**
 * Given an upload and a socket, defines the socket listeners to handle
 * client/server communication.
 * @param {*} socketId 
 * @param {*} socket 
 * @param {*} uploadId 
 * @param {*} upload 
 */
function addGifMakerUpload(socketId, socket, uploadId, upload) {
  // if this socket already has uploads associated with it
  if (connections[socketId]) {
    connections[socketId].uploads[uploadId] = upload;
  }
  else {
    connections[socketId] = {};
    connections[socketId].uploads = {};
    connections[socketId].uploads[uploadId] = upload;
    connections[socketId].socket = socket;
    addEventHandlers(socket, socketId);
  }
}

exports.addGifMakerUpload = addGifMakerUpload;