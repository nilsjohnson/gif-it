const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('../const');
AWS.config.update({ region: 'us-east-1' })
let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const { MAX_TAG_LENGTH } = require('../const');


function isValidTag(tag) {
    console.log(`testing tag '${tag}'`);
    let letters = /^[0-9a-zA-Z ]+$/;
    if (tag.match(letters) && tag.length <= MAX_TAG_LENGTH) {
        return true;
    }

    return false;
}

function makeTag(input) {
    // trim it
    let tag = input.trim();
    // remove a leading #
    if(tag.startsWith('#')) {
        tag = tag.substring(1)
    }
    // enforce single spacing for multi-word tags
    tag = tag.replace(/\s+/g, ' ');
    return tag;
}

/**
 * @param {*} Array of tags
 * @return Array of tags that have been sanitized
 * @throws any errors
 */
function processTags(tags) {
    let processedTags = [];

    for(let i = 0; i < tags.length; i++) {
        let tag = makeTag(tags[i]);
        if(isValidTag(tag)) {
            processedTags.push(tag);
        }
        else {
            // Note this should never happen, since we validae client-side.
            throw(`${tags[i]} is not a valid tag.`);
        }
    }

    if(processedTags.length === 0) {
        throw("Please Add Tags.");
    }

    return processedTags;
}


/**
 * Uploads a file to s3
 * @param {*} objectPath   The path of the file
 * @param {*} onSucess     callback if success
 * @param {*} onFail       callback if failure
 */
function transferGifToS3(objectPath, onSucess = null, onFail = null) {
    console.log(objectPath);
    let uploadParams = { Bucket: BUCKET_NAME, Key: '', Body: '', ContentType: "image/gif" };
    let file = objectPath;

    var fileStream = fs.createReadStream(file);
    fileStream.on('error', function (err) {
        console.log('File Error', err);
    });
    uploadParams.Body = fileStream;
    uploadParams.Key = path.basename(file);

    // call S3 to retrieve upload file to specified bucket
    s3.upload(uploadParams, function (err, data) {
        if (err) {
            if (DEBUG) { console.log(`Problem Transfering to S3: ${err}`); }
            if (onFail) {
                onFail(err);
            }
        }
        if (data) {
            if (DEBUG) { console.log(`Transfer to S3 sucess: ${data}`); }
            if (onSucess) {
                onSucess(data);
            }
        }
    });
}

/**
 * 
 * @param {*} key       The objects key
 * @param {*} onSucess  optional callback 
 * @param {*} onFail    optional callback
 */
function deleteFromS3(key = "", onSucess = null, onFail = null) {
    var params = { Bucket: BUCKET_NAME, Key: key };

    s3.deleteObject(params, (err, data) => {
        if (err) {
            console.log(err, err.stack);  // error
            if(onFail) {
                onFail(err);
            }
        }
        else {
            if(DEBUG) { console.log(`${key} deleted from s3 successfully.`); }
            if(onSucess) {
                onSucess(data);
            }
        }         
    })
}

exports.processTags = processTags;
exports.deleteFromS3 = deleteFromS3;
exports.splitTags = processTags;
exports.transferGifToS3 = transferGifToS3;