const { spawn } = require('child_process');


function convertToGif(src, dst, socketId, uploadId, onStdout, onStderr, onClose) {
    let duration = null;

    const ffmpegProcess = spawn(
        'ffmpeg',
        ['-i', src,
            '-vf', 'scale=512:-1',
            '-r', '30',
            '-nostdin', // disable interaction
            dst]);

    ffmpegProcess.stdout.on('data', (data) => {
        // FFmpeg uses the stderr stream for information
        // and reserves this stream for streaming video and similar.
    });

    ffmpegProcess.stderr.on('data', (data) => {
        onStderr(socketId, uploadId, data.toString())
    });

    ffmpegProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        onClose(socketId, uploadId); 
    });
}

function myfunc() {
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

      
    });

}

function extractDuration(str) {
    let arr = str.match(/Duration:\s\d{2}:\d{2}:\d{2}\.\d{2}/)
    return arr;
  }


exports.convertToGif = convertToGif;



// function convertToGif(src, dst, socketId, fileId) {
//     let duration = null;

//     const ffmpegProcess = spawn(
//         'ffmpeg',
//         ['-i', src,
//             '-vf', 'scale=512:-1',
//             '-r', '30',
//             '-nostdin', // disable interaction
//             dst]);

//     ffmpegProcess.stdout.on('data', (data) => {
//         sockets[socketId].emit("ConversionProgress", { fileId: fileId, conversionStatus: data.toString() });
//     });

//     ffmpegProcess.stderr.on('data', (data) => {
//         if (duration === null && extractDuration(data.toString())) {
//             duration = (extractDuration(data.toString())[0]);
//         }
//         console.log("stderr: " + data.toString());
//         sockets[socketId].emit("ConversionProgress", { fileId: fileId, conversionStatus: data.toString() });
//     });

//     ffmpegProcess.on('close', (code) => {
//         console.log(`child process exited with code ${code}`);
//         if (code === 0) {
//             sockets[socketId].emit("ConversionProgress", { fileId: fileId, conversionStatus: "done." });
//             sockets[socketId].emit("ConversionComplete", { fileId: fileId });
//         }
//         else {
//             sockets[socketId].emit("ConversionProgress", { fileId: fileId, conversionStatus: "Error." });
//         }
//     });
// }