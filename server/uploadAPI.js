const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const { app, http, https, serveMode } = require('./server');
const { ServeModes, FilePaths, MAX_UPLOAD_SIZE } = require('./const');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const { addGif } = require('./dataAccess');
const { getFileName_noExtension, getUniqueID } = require("./fileUtil");

app.use(bodyParser.json());
const io = (serveMode === ServeModes.DEV ? require('socket.io')(http) : require('socket.io').listen(https));


/**
 * Holds locations of file uploads - { uploadId : filePath }
 */
let fileMap = {};
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

/**
 * adds a socket to sockets and defines its listeners
 */
function addSocket(newSocket) {
  let id = newSocket.id;
  sockets[id] = newSocket; 

  if(DEBUG) {
    let numSockets = Object.keys(sockets).length;
    console.log(`There ${numSockets > 1 ? "are" : "is"} ${numSockets} socket${numSockets > 1 ? "s" : ""} open right now.`);
  }

  sockets[id].on("disconnect", () => {
    console.log(`Socket ${id} disconnected`);
    deleteSocket(id);
  });

  sockets[id].on("ConvertRequested", (fileId) => {
    console.log(`fid ${fileId}`);
    convertToGif(fileMap[fileId], path.join(FilePaths.GIF_SERVE_DIR, fileId + ".gif"), id, fileId);
  });

  sockets[id].on("ShareRequest", (data) => {
    console.log(data);
    addGif(data.fileId, data.fileId + ".gif");
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
  let fileID = getUniqueID();

  // validaion here..
  if(fileSize/ (1000*1000).toFixed(2) > MAX_UPLOAD_SIZE) {
    if(DEBUG) { 
      console.log(`Chosen file is ${fileSize/ (1000*1000).toFixed(2)} MB, while ${MAX_UPLOAD_SIZE} MB is the maximum. Returning 400..`)
    };
    res.status(400);
    res.send({err: "File Too Large."});
    res.end();
    return;
  }

  busboy.on('file', function (fieldname, file, givenFilename, encoding, mimetype) {
    fileName = givenFilename;
    newName = getFileName_noExtension(givenFilename) + ""
    uploadDst = path.join(FilePaths.UPLOAD_DIR + "/" + givenFilename);
    fileMap[fileID] = uploadDst;

    sockets[socketId].emit("UploadStart", {fileId: fileID, percentUploaded: 0, size: fileSize});

    file.on('data', function (data) {
      bytesRecieved = bytesRecieved + data.length;
      // sockets[socketId].emit("FromAPI", Math.round(bytesRecieved * 100 / fileSize) + '% Uploaded');
      let percentUploaded = Math.round(bytesRecieved * 100 / fileSize);
      sockets[socketId].emit("UploadProgress", {
        fileName: fileName,
        fileId: fileID, 
        percentUploaded: percentUploaded, 
        conversionStatus: null,
        size: fileSize,
        servePath: null,
       });
    });

    file.pipe(fs.createWriteStream(uploadDst));
  });


  busboy.on('finish', function () {
    let videoLength;
    const ffpropeProcess = spawn(
      'ffprobe', [
        '-v', '16',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        uploadDst
      ]);
  
    ffpropeProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      videoLength = parseFloat(data);
    });
  
    ffpropeProcess.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
  
    ffpropeProcess.on('close', (code) => {
      console.log(`close: ${code}`);
      console.log(`duration: ${videoLength}`);

      sockets[socketId].emit("uploadComplete", {
        videoLength: videoLength,
        uploadedTime: new Date(),
        fileId: fileID
      });

      // finish was called so upload was success.
      res.writeHead(200, { 'Connection': 'close' });
      res.end();
    });

   
  });

  return req.pipe(busboy);
});

function extractDuration(str) {
  let arr = str.match(/Duration:\s\d{2}:\d{2}:\d{2}\.\d{2}/)
  return arr;
}

function convertToGif(src, dst, socketId, fileId) {
  let duration = null;

  const ffmpegProcess = spawn(
    'ffmpeg',
    [ '-i', src,
    '-vf', 'scale=512:-1',
    '-r', '30', 
    '-nostdin', // disable interaction
      dst]);

  ffmpegProcess.stdout.on('data', (data) => {
    sockets[socketId].emit("ConversionProgress", {fileId: fileId, conversionStatus: data.toString()});
  });

  ffmpegProcess.stderr.on('data', (data) => {
    if(duration === null && extractDuration(data.toString())) {
      duration = (extractDuration(data.toString())[0]);
      
    }
    // console.log("stderr: " + data.toString());
    sockets[socketId].emit("ConversionProgress", {fileId: fileId, conversionStatus: data.toString()});
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if(code === 0) {
      sockets[socketId].emit("ConversionProgress", {fileId: fileId, conversionStatus: "done."});
      sockets[socketId].emit("ConversionComplete", {fileId: fileId});
    }
    else {
      sockets[socketId].emit("ConversionProgress", {fileId: fileId, conversionStatus: "Error."});
    }
  });
}
