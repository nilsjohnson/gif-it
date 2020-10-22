const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { FilePaths } = require('../const');
const Job = require('../uploadAPI/Job')


const QUALITY = {
  THUMB: 1,
  SM: 2,
  MD: 3,
  LG: 4
}


let jobs = [];
let numJobsRunning = 0;
const MAX_JOBS = 4;

const DEBUG_CONVERT = false;

function getOptions(src, dst, quality) {
  if (quality === QUALITY.THUMB) {
    return ['-i', src,
      '-ss', '0', '-t', '7', // start at 0 and make a 3 second gif
      '-vf', 'fps=6,scale=300:-1',
      '-loop', '0', // infinate loop
      '-nostdin', // disable interaction
      dst]
  }
  if (quality === QUALITY.SM) {
    return ['-i', src,
      '-vf', 'fps=12,scale=500:-1',
      '-loop', '0', // infinate loop
      '-nostdin', // disable interaction
      dst];
  }
  if (quality === QUALITY.MD) {
    return ['-i', src,
      '-vf', 'fps=12,scale=750:-1',
      '-loop', '0', // infinate loop
      '-nostdin', // disable interaction
      dst];
  }
  if (quality === QUALITY.LG) {
    return ['-i', src,
      '-vf', 'fps=12,scale=1000:-1',
      '-loop', '0', // infinate loop
      '-nostdin', // disable interaction
      dst];
  }
}

/**
 * Converts a video to a gif and a makes thumbnail
 * @param {Job} job 
 */
function convertToGif(job) {
  const {
    src,
    uploadId,
    quality,
    onStdout,
    onProgress,
    onGifMade,
    onThumbMade } = job;

  // make the gif
  let totalDuration = null;
  let curSpeed = null;
  let progress = null;
  let qual;
  let fullSizeFileName = uploadId + ".gif";
  let thumbFileName = uploadId + ".thumb.gif";
  let dstFullSize = path.join(FilePaths.GIF_SAVE_DIR, fullSizeFileName);
  let dstThumbnail = path.join(FilePaths.GIF_SAVE_DIR, thumbFileName);
  // ffmpeg output, as a string
  let output_str = null;

  switch (quality) {
    case "sm":
      qual = QUALITY.SM;
      break;
    case "lg":
      qual = QUALITY.LG;
      break;
    default:
      qual = QUALITY.MD;
  }

  const makeGifProcess = spawn('ffmpeg', getOptions(src, dstFullSize, qual));
  makeGifProcess.stdout.on('data', (data) => { });
  // this callback, calls back the onProgress callback to notify user conversion status 
  makeGifProcess.stderr.on('data', (output) => {
    let temp, data;
    output_str = output.toString();

    if (DEBUG_CONVERT) { console.log(output_str); }

    temp = extractSpeed(output_str);
    curSpeed = (temp ? temp : curSpeed);

    if (!totalDuration) {
      totalDuration = extractDuration(output_str);
    }
    temp = caclulateProgress(output_str, totalDuration);
    progress = (temp ? temp : progress);

    if (DEBUG_CONVERT) { console.log(`${progress}% converted`); }

    // if we have progress and speed values
    if (progress && curSpeed) {
      data = { curSpeed: curSpeed, progress: progress + '%' };
    }
    // if we dont have progress but do have speed
    else if (!progress && curSpeed) {
      data = { curSpeed: curSpeed, progress: 'Please Wait...' };
    }
    // if we have progress not not speed
    else if (progress && !curSpeed) {
      data = { curSpeed: '-', progress: progress };
    }
    // if we dont know either
    else {
      data = { curSpeed: '-', progress: 'Please Wait...' };
    }

    data.curOutput = output_str;
    data.uploadId = uploadId;
    onProgress(data);
  });
  makeGifProcess.on('close', (code) => {
    // if the gif was made successfully
    if (code === 0) {


      // as far as user knows, we are done, however, we 
      // silently make a thumbnail now in the background
      const makeThumbProcess = spawn('ffmpeg', getOptions(src, dstThumbnail, QUALITY.THUMB));
      makeThumbProcess.stdout.on('data', (data) => { });
      makeThumbProcess.stderr.on('data', (data) => { });
      makeThumbProcess.on('close', (code) => {
        if (code === 0) {
          // success
          onThumbMade(uploadId, dstThumbnail);
        }
        else { // TODO if fails, its probably beacuse the video was < 3 seconds...We should be able to check that before hand and reduce if necessary.
          // make copy the gif to the thumbnail. AKA the gif and thumbnail are the same.
          // this will happen as a last resort but ensures there is always a thumbnail.
          fs.copyFile(dstFullSize, dstThumbnail, (err) => {
            if (err) throw err;
            console.log('thumbnail not made successfully, so fullsize file is being used as thumbnail instead.');
            onThumbMade(uploadId, dstThumbnail);
          });
          
        }
      });

      // notify gif was successfully made, along with the thumbnail that's coming up
      onGifMade(uploadId, dstFullSize, dstThumbnail);
    }
    // gif was not made successfully
    else {
      console.log(`Problem converting ${src} to .gif.`);
      onGifMade(uploadId, null, null, output_str);
    }
    if (jobs.length > 0) {
      convertToGif(jobs.shift());
    }
    else {
      running = false;
      numJobsRunning--;
    }
  });

}

/**
 * 
 * @param {Job} job 
 */
function addJob(job) {
  jobs.push(job);

  if (jobs.length > 0 && numJobsRunning < MAX_JOBS) {
    convertToGif(jobs.shift());
    numJobsRunning++;
  }
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
 * Parses a string to find a string representing the duration.
 * @param {*} str   The stderr output from ffmpeg
 * @return          The duration of the video, if found, otherwise null.
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

/**
 * Looks for a timestamp on the current output to see if we can get a progress update.
 * 
 * @param {*} str 
 * @param {*} totalDuration 
 */
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
 * Parses a regex group to get the time in seconds
 * 
 * @param {*} group   A regex group that contains hours, min, sec, cenitiSec
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

  if (DEBUG_CONVERT) {
    console.log("Getting the total seconds from regex group.");
    console.log("\t" + secInHour);
    console.log("\t" + secInMin);
    console.log("\t" + sec);
    console.log("\t" + centiSec);
    console.log("    + " + "_______");
    console.log("\t" + totalSeconds + " Total Seconds");
  }
  return totalSeconds;
}

exports.addJob = addJob;