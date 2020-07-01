const fs = require('fs');
const path = require('path');
const os = require('os');
const Busboy = require('busboy');
const { app, http, https, serveMode } = require("./server");
const { spawn } = require('child_process');
const crypto = require("crypto");
const bodyParser = require('body-parser');
const { addGif } = require('./dataAccess');

app.use(bodyParser.json());

const DEV = 0;

const io = serveMode === DEV ? require('socket.io')(http) : require('socket.io').listen(https);

function getUniqueID() {
  return crypto.randomBytes(6).toString("base64");
}

function getExtension(fileName) {
  return path.extname(fileName);
}

function getFileName_noExtension(fileName) {
  return path.parse(fileName).name
}

const UPLOAD_DIR = os.tmpdir + '/' + 'gif-it';
const SERVE_DIR = path.join(__dirname, '../gifs');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}
if (!fs.existsSync(SERVE_DIR)) {
  fs.mkdirSync(SERVE_DIR);
}

let fileMap = {};

let sockets = {};

io.on("connection", (newSocket) => {
  console.log("New client connected!");
  let id = newSocket.id;
  sockets[id] = newSocket; 

  sockets[id].on("disconnect", () => {
    console.log(`Socket ${id} disconnected`);
  });

  sockets[id].on("ConvertRequested", (fileId) => {
    console.log(`fid ${fileId}`);
    convertToGif(fileMap[fileId], path.join(SERVE_DIR, fileId + ".gif"), id, fileId);
  });

  sockets[id].on("ShareRequest", (data) => {
    console.log(data);
    addGif(data.fileId, data.fileId + ".gif");
  }); 
});

/**
 * This API handles a file upload and then coverts it to GIF
 */
app.post('/api/videoUpload/:socketId', function (req, res) {
  console.log("started upload");
  let socketId = req.params.socketId;

  let busboy = new Busboy({ headers: req.headers });
  let bytesRecieved = 0;
  let fileSize = req.headers["content-length"];
  let uploadDst;
  let fileName;
  let fileID = getUniqueID();

  // validaion here..
  if(fileSize/ (1000*1000).toFixed(2) > 100) {
    res.writeHead(400, { 'Connection': 'close' });
    res.end();
  }

  busboy.on('file', function (fieldname, file, givenFilename, encoding, mimetype) {
    fileName = givenFilename;
    newName = getFileName_noExtension(givenFilename) + ""
    uploadDst = path.join(UPLOAD_DIR + "/" + givenFilename);
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
