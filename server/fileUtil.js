const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const { FilePaths } = require('./const');



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
    let id = crypto.randomBytes(8).toString("hex");
    return id;
}

// TODO, if fileName already exists, 
// increment it.
function checkUnique(fileName) {
    return fileName;
}

exports.getExtension = getExtension;
exports.getFileName_noExtension = getFileName_noExtension;
exports.getUniqueID = getUniqueID;
exports.checkUnique = checkUnique;