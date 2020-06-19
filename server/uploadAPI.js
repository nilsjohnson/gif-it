const fs = require('fs');
const path = require('path');
const os = require('os');
const Busboy = require('busboy');
const { app } = require("./server");
const { spawn } = require('child_process');
const { http } = require("./server");

// for sockets
const io = require('socket.io')(http);

// let interval;

// io.on("connection", (socket) => {
//   console.log("New client connected!");
//   if (interval) {
//     clearInterval(interval);
//   }
//   interval = setInterval(() => getApiAndEmit(socket), 1000);
//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//     clearInterval(interval);
//   });
// });

// const getApiAndEmit = socket => {
//   const response = new Date();
//   // Emitting a new message. Will be consumed by the client
//   socket.emit("FromAPI", response);
// };

let me_socket;

io.on("connection", (socket) => {
  console.log("New client connected!");
  me_socket = socket;

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

});

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};


app.post('/api/videoUpload', function (req, res) {
    console.log('hit');
    var busboy = new Busboy({ headers: req.headers });
    let file_name;

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      me_socket.emit("FromAPI", "uploading");
      file_name = filename;
      var saveTo = path.join(__dirname, 'uploads/' + filename);
      file.pipe(fs.createWriteStream(saveTo));
    });

    busboy.on('finish', function() {
      me_socket.emit("FromAPI", "converting");
      const ffmpeg = spawn(
            'ffmpeg', 
            ['-i', path.join(__dirname, 'uploads/' + file_name), 
            path.join(__dirname, 'uploads/' + file_name + '.gif')]);

            ffmpeg.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        
        ffmpeg.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });
        
        ffmpeg.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            me_socket.emit("FromAPI", `child process exited with code ${code}`);
        });
        
        res.writeHead(200, { 'Connection': 'close' });
        res.end();

    });

    return req.pipe(busboy);
});
