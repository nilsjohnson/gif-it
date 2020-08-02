const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('../const');
AWS.config.update({ region: 'us-east-1' })
let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

/**
 * @param {*} tags_str A string of tags from the user
 * @return an array of from the input, split by words. 
 * Each Element will be alphanumeric and lowercase.
 */
function splitTags(tags_str) {
    let regex = /\w+/g;
    let arr = tags_str.match(regex);
    if (arr) {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].toLowerCase();
        }
        return arr;
    }
    return null;
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


exports.deleteFromS3 = deleteFromS3;
exports.splitTags = splitTags;
exports.transferGifToS3 = transferGifToS3;