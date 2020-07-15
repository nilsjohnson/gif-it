const { spawn } = require('child_process');

const QUALITY = {
  THUMB: 1,
  WEB: 2
}

function getOptions(src, dst, quality) {
  if (quality === QUALITY.THUMB) {
    return ['-i', src,
      '-ss', '0', '-t', '3', // start at 0 and make a 3 second gif
      '-vf', 'fps=6,scale=150:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
      '-loop', '0', // infinate loop
      '-nostdin', // disable interaction
      dst]
  }
  if (quality === QUALITY.WEB) {
    return ['-i', src,
      '-vf', 'fps=10,scale=256:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
      '-loop', '0', // infinate loop
      '-nostdin', // disable interaction
      dst];
  }
}

function makeThumbnail(src, dst, uploadId) {

  const ffmpegProcess = spawn(
    'ffmpeg',
    getOptions(src, dst, 1));

  ffmpegProcess.stdout.on('data', (data) => {
    // FFmpeg uses the stderr stream for information
    // and reserves this stream for streaming video and similar.
  });

  ffmpegProcess.stderr.on('data', (data) => {
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    onClose(socketId, uploadId, `${uploadId}.gif`);
  });
}



function convertToGif(src, dst, socketId, uploadId, onStdout, onStderr, onClose) {
  // make the thumbnail
  let thumbDst = dst.replace('.gif', '.thumb.gif');
  const ffmpegProcess = spawn('ffmpeg', getOptions(src, thumbDst, 1));
  ffmpegProcess.stdout.on('data', (data) => {});
  ffmpegProcess.stderr.on('data', (data) => {});
  ffmpegProcess.on('close', (code) => {
    if(code === 0) {
      thumbDst = 
      console.log("thumbnail created.");
    } else {
      thumbDst = null;
      console.log(`Thumbnail not created. Returned ${code}`);
    }

    let totalDuration = null;
    let curSpeed = null;
    let progress = null;

    const ffmpegProcess = spawn(
      'ffmpeg',
      getOptions(src, dst, 2));

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

      if (!totalDuration) {
        totalDuration = extractDuration(conversionOutput);
      }
      temp = caclulateProgress(conversionOutput, totalDuration);
      progress = (temp ? temp : progress);

      console.log(`${progress}% converted`);


      onStderr(socketId, uploadId, { curSpeed: curSpeed, progress: progress });
    });

    ffmpegProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      onClose(socketId, uploadId, `${uploadId}.gif`, `${uploadId}.thumb.gif`, );
    });
  });
}

function extractSpeed(str) {
  let regex = /speed=\s?(?<speed>\d+\.\d+x)/;
  let result = str.match(regex);

  if (result) {
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

  if (result) {
    let group = result.groups;
    return groupToSeconds(group);
  }
  return null;
}

function caclulateProgress(str, totalDuration) {
  if (!totalDuration) {
    return null;
  }

  let regex = /time=(?<hours>\d{2}):(?<min>\d{2}):(?<sec>\d{2})\.(?<centiSec>\d{2})/;
  let result = str.match(regex);

  if (result) {
    let group = result.groups;
    let seconds = groupToSeconds(group);
    return Math.round(seconds / totalDuration * 100);
  }

  return null;
}

/**
 * 
 * @param {*} group A regex group that contains hours, min, sec, cenitiSec
 */
function groupToSeconds(group) {
  if (!group) {
    return null;
  }

  let secInHour = group.hours * 60 * 60;
  let secInMin = group.min * 60;
  let sec = group.sec;
  let centiSec = group.centiSec / 100;

  let totalSeconds = secInHour + secInMin + sec + centiSec;

  console.log(secInHour);
  console.log(secInMin);
  console.log(sec);
  console.log(centiSec);
  console.log("Total Seconds: " + totalSeconds);

  return totalSeconds;
}

exports.convertToGif = convertToGif;