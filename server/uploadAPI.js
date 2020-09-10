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
const { addGifMakerUpload } = require('./makeGifAPI');
let io = require('socket.io')(http) 

io.set('origins', DEV ? 'http://localhost:3000' : 'https://gif-it.io:*');
let authDAO = new AuthDAO();

/**
 * Holds open connections - { socketId_1 : { socket: socket, uploads: {} }, socketId_2 : .... }
 */
let connections = {};

/**
 * deletes a socket by its id;
 */
function deleteSocket(socketId) {
  if (delete connections[socketId]) {
    if (DEBUG) { console.log(`Socket ${socketId} has been deleted`); }
  } 
  else {
    console.log(`Problem deleting ${socketId}.`);
  }

  if (DEBUG) {
    console.log(`Here are the current connections.`);
    console.log(connections);
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
    console.log(`Socket ${socketId} disconnected from uploadAPI`);
    deleteSocket(socketId);
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
 * This API handles a file upload and then coverts it to GIF
 */
app.post('/upload/:socketId/:tempUploadId/:action', function (req, res) {
  if (DEBUG) { console.log(`video upload hit by socket ${req.params.socketId}.`); }
  
  let userId = authDAO.authenticate(req.headers);
  if(!userId) {
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
      if (!mimetype.startsWith('video')) {
        if (DEBUG) { console.log(`${givenFileName} has invalid mimetype. ${mimetype} privided, but 'video/*' is required.`); }
        res.status(400);
        res.json({ error: `${givenFileName}: Unsupported Format` });
        return;
      }
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
        if(DEBUG) { console.log(`upload progress: ${percentUploaded}% for uploadId ${uploadId}`); }
        if(connections[socketId] && connections[socketId].socket) {
          // only send new value if its greater than before to avoid sending like '2%...2%...3%...'
          if(newPercentUploaded > percentUploaded) {
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

      if(connections[socketId].uploads[uploadId].action === 'make_gif') {
        // socketId, socket, uploadId, upload
        let socket = connections[socketId].socket;
        let upload = connections[socketId].uploads[uploadId];
        delete connections[socketId];
        addGifMakerUpload(socketId, socket, uploadId, upload);
        
      }

      // finish was called so upload was success.
      res.writeHead(200, { 'Connection': 'close' });
      res.end();
    });

    return req.pipe(busboy);
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
