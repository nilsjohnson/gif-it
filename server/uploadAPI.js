const fs = require('fs');
const path = require('path');
const os = require('os');
const Busboy = require('busboy');
const { app } = require("./server");
const { spawn } = require('child_process');
const { http } = require("./server");

// for sockets
const io = require('socket.io')(http);
// for generating unique file names
const crypto = require("crypto");

function getUniqueID() {
  return crypto.randomBytes(16).toString("hex");
}

function getExtension(fileName) {
  let extension = path.extname(fileName)
  console.log(`This file's extension is ${extension}`);
  return extension;
}

/**
 * The socket for this connection
 */
let socket;



const UPLOAD_DIR = os.tmpdir + '/' + 'gif-it';
const SERVE_DIR = path.join(__dirname, '../gifs');
if(!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}
if(!fs.existsSync(SERVE_DIR)) {
  fs.mkdirSync(SERVE_DIR);
}


io.on("connection", (newSocket) => {
  console.log("New client connected!");
  socket = newSocket;

  newSocket.on("disconnect", () => {
    console.log("Client disconnected");
  });

});


/**
 * This API handles a file upload and then coverts it to GIF
 */
app.post('/api/videoUpload', function (req, res) {
    let busboy = new Busboy({ headers: req.headers });
    let bytesRecieved = 0;
    let fileSize = req.headers["content-length"];
    let newName = getUniqueID() + ".gif";
    let uploadDst;
    let convertDst;

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      uploadDst = path.join(UPLOAD_DIR + "/" + newName + getExtension(filename));
      convertDst = path.join(SERVE_DIR + "/" + newName);
      
      file.on('data', function(data) {
        bytesRecieved = bytesRecieved + data.length;
        socket.emit("FromAPI", Math.round(bytesRecieved*100/fileSize) + '% Uploaded');
      });

      file.pipe(fs.createWriteStream(uploadDst));
    });


    busboy.on('finish', function() {
      socket.emit("FromAPI", "Converting to .gif...");
      const ffmpeg = spawn(
            'ffmpeg', 
            ['-i', uploadDst, 
            convertDst]);

        ffmpeg.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
          //socket.emit("FromAPI", data);
        });
        
        ffmpeg.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
          //socket.emit("FromAPI", data);
        });
        
        ffmpeg.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            //socket.emit("FromAPI", `child process exited with code ${code}`);
            socket.emit("complete", newName);
        });
        
        res.writeHead(200, { 'Connection': 'close' });
        res.end();

    });

    return req.pipe(busboy);
});
