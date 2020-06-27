const fs = require('fs');
const path = require('path');
const os = require('os');
const Busboy = require('busboy');
const { app, http, https, serveMode } = require("./server");
const { spawn } = require('child_process');
const crypto = require("crypto");
const bodyParser = require('body-parser')

app.use(bodyParser.json());

const DEV = 0;

const io = serveMode === DEV ? require('socket.io')(http) : require('socket.io').listen(https);

function getUniqueID() {
  return crypto.randomBytes(6).toString("hex");
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

let sockets = {};

io.on("connection", (newSocket) => {
  console.log("New client connected!");
  let id = newSocket.id;
  sockets[id] = newSocket; 

  sockets[id].on("disconnect", () => {
    console.log(`Socket ${id} disconnected`);
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

  busboy.on('file', function (fieldname, file, givenFilename, encoding, mimetype) {
    fileName = givenFilename;
    newName = getFileName_noExtension(givenFilename) + ""
    uploadDst = path.join(UPLOAD_DIR + "/" + givenFilename);

    sockets[socketId].emit("UploadStart", {fileId: fileID, percentUploaded: 0, size: fileSize});

    file.on('data', function (data) {
      bytesRecieved = bytesRecieved + data.length;
      // sockets[socketId].emit("FromAPI", Math.round(bytesRecieved * 100 / fileSize) + '% Uploaded');
      let percentUploaded = Math.round(bytesRecieved * 100 / fileSize);
      sockets[socketId].emit("UploadProgress", {
        fileName: fileName,
        fileId: fileID, 
        percentUploaded: 
        percentUploaded, 
        size: fileSize});
    });

    file.pipe(fs.createWriteStream(uploadDst));
  });


  busboy.on('finish', function () {
    sockets[socketId].emit("uploadComplete", Date.now())
    res.writeHead(200, { 'Connection': 'close' });
    res.end();
  });

  return req.pipe(busboy);
});

function convertToGif(src, dst) {
  const ffmpegProcess = spawn(
    'ffmpeg',
    ['-i', src,
      dst]);

  ffmpegProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    //socket.emit("FromAPI", data);
  });

  ffmpegProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    //socket.emit("FromAPI", data);
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    //socket.emit("FromAPI", `child process exited with code ${code}`);
    socket.emit("complete", newName);
  });
}
