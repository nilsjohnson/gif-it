const { spawn } = require('child_process');

const QUALITY = {
  THUMB: 1,
  SM: 2,
  MD: 3,
  LG: 4
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
  if (quality === QUALITY.SM) {
    return ['-i', src,
      '-vf', 'fps=10,scale=256:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
      '-loop', '0', // infinate loop
      '-nostdin', // disable interaction
      dst];
  }
  if (quality === QUALITY.MD) {
    return ['-i', src,
      '-vf', 'fps=10,scale=512:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
      '-loop', '0', // infinate loop
      '-nostdin', // disable interaction
      dst];
  }
  if (quality === QUALITY.LG) {
    return ['-i', src,
      '-vf', 'fps=10,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
      '-loop', '0', // infinate loop
      '-nostdin', // disable interaction
      dst];
  }
}

function convertToGif(src, dst, socketId, uploadId, quality, onStdout, onStderr, onClose) {
  // make the gif
  let totalDuration = null;
  let curSpeed = null;
  let progress = null;

  switch (quality) {
    case "sm":
      quality = QUALITY.SM;
      break;
    case "lg":
      quality = QUALITY.LG;
      break;
    default:
      quality = QUALITY.MD;
  }

  const ffmpegProcess = spawn('ffmpeg', getOptions(src, dst, quality));
  ffmpegProcess.stdout.on('data', (data) => { });
  ffmpegProcess.stderr.on('data', (output) => {
    let temp, data;
    let output_str = output.toString();
    console.log(output_str);

    temp = extractSpeed(output_str);
    curSpeed = (temp ? temp : curSpeed);

    if (!totalDuration) {
      totalDuration = extractDuration(output_str);
    }
    temp = caclulateProgress(output_str, totalDuration);
    progress = (temp ? temp : progress);

    console.log(`${progress}% converted`);

    // if we have progress and speed values
    if(progress && curSpeed) {
      data = { curSpeed: curSpeed, progress: progress + '%' };
    } 
    // if we dont have progress but do have speed
    else if(!progress && curSpeed) {
      data = { curSpeed: curSpeed, progress: 'Please Wait...' };
    }
    // if we have progress not not speed
    else if(progress && !curSpeed) {
      data = { curSpeed: '-', progress: progress };
    }
    // if we dont know either
    else {
      data = { curSpeed: '-', progress: 'Please Wait...' };
    }

    data.curOutput = output_str;
    data.uploadId = uploadId;
    onStderr(socketId, data );
  });
  ffmpegProcess.on('close', (code) => {
    if (code === 0) {
      // as far as user knows, we are done, however, we silently make a 
      // thumbnail now in the background
      onClose(socketId, uploadId, `${uploadId}.gif`, `${uploadId}.thumb.gif`);

      let thumbDst = dst.replace('.gif', '.thumb.gif');
      const ffmpegProcess = spawn(
        'ffmpeg',
        getOptions(src, thumbDst, QUALITY.THUMB));

      ffmpegProcess.stdout.on('data', (data) => { });

      ffmpegProcess.stderr.on('data', (data) => {
        console.log(data.toString());
      });

      ffmpegProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        
      });
    }
    else {
      onClose(socketId, uploadId, null, null);
    }
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