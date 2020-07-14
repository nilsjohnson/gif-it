const { spawn } = require('child_process');

function convertToGif(src, dst, socketId, uploadId, onStdout, onStderr, onClose) {
  let totalDuration = null;
  let curSpeed = null;
  let progress = null;

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
    let temp 
    let conversionOutput = data.toString();
    console.log(conversionOutput);
    
    temp = extractSpeed(conversionOutput);
    curSpeed = (temp ? temp : curSpeed);

    if(!totalDuration) {
      totalDuration = extractDuration(conversionOutput);
    }
    temp = caclulateProgress(conversionOutput, totalDuration);
    progress = (temp ? temp : progress);

    console.log(`${progress}% converted`);


    onStderr(socketId, uploadId, {curSpeed: curSpeed, progress: progress});
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    onClose(socketId, uploadId, `${uploadId}.gif`);
  });
}

function extractSpeed(str) {
  let regex = /speed=\s?(?<speed>\d+\.\d+x)/;
  let result = str.match(regex);

  if(result) {
    console.log("str:" + result);
    let group = result.groups;
    return group.speed;
  }

  return null;
}

/**
 * 
 * @param {*} str The stderr output from ffmpeg
 * @return The duration of the video, if found, otherwise null.
 */
function extractDuration(str) {
  console.log("duration str: " + str);
  let regex = /Duration:\s(?<hours>\d{2}):(?<min>\d{2}):(?<sec>\d{2})\.(?<centiSec>\d{2})/;
  let result = str.match(regex);
  
  console.log("res " + result);

  if(result) {
    let group = result.groups;
    return groupToSeconds(group);
  }
  return null;
}

function caclulateProgress(str, totalDuration) {
  if(!totalDuration) {
    return null;
  }
  
  let regex = /time=(?<hours>\d{2}):(?<min>\d{2}):(?<sec>\d{2})\.(?<centiSec>\d{2})/;
  let result = str.match(regex);

  if(result) {
    let group = result.groups;
    let seconds = groupToSeconds(group);
    return Math.round(seconds/totalDuration*100);
  }

  return null;
}

/**
 * 
 * @param {*} group A regex group that contains hours, min, sec, cenitiSec
 */
function groupToSeconds(group) {
  if(!group) {
    return null;
  }

  let secInHour = group.hours * 60 * 60;
  let secInMin = group.min * 60;
  let sec = group.sec;
  let centiSec = group.centiSec/100;

  let totalSeconds = secInHour + secInMin + sec + centiSec;

  console.log(secInHour);
  console.log(secInMin);
  console.log(sec);
  console.log(centiSec);
  console.log("Total Seconds: " + totalSeconds);

  return totalSeconds;
}

exports.convertToGif = convertToGif;






















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