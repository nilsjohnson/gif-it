const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const { FilePaths } = require('../const');



if (!fs.existsSync(FilePaths.UPLOAD_DIR)) {
    fs.mkdirSync(FilePaths.UPLOAD_DIR);
}

if (!fs.existsSync(FilePaths.GIF_SAVE_DIR)) {
    fs.mkdirSync(FilePaths.GIF_SAVE_DIR);
}

function getExtension(fileName) {
    return path.extname(fileName);
}

function getFileName_noExtension(fileName) {
    return path.parse(fileName).name
}

function getUniqueID() {
    let id = crypto.randomBytes(6).toString("base64");
    while (id.includes('/') || id.includes('+')) {
        id = crypto.randomBytes(6).toString("base64");
    }

   return id;
}

// TODO, if fileName already exists, 
// increment it.
function checkUnique(fileName) {
    return fileName;
}

/*
Writes object to file as JSON. Async.
*/
function writeObj(obj, name) {
    fs.writeFile(name, JSON.stringify(obj, null, 2), function (err) {
        if (err) {
            console.log(error)
        }
        else {
            console.log("file saved!");
        }
    });
}

/*
Reads JSON object from file and returns it. Sync.
*/
function readObj(name) {
    let obj = {};
    try {
        obj = JSON.parse(fs.readFileSync(name));
    }
    catch (err) {
        //console.log(err);
    }
    return obj;
}


exports.writeObj = writeObj;
exports.readObj = readObj;
exports.getExtension = getExtension;
exports.getFileName_noExtension = getFileName_noExtension;
exports.getUniqueID = getUniqueID;
exports.checkUnique = checkUnique;