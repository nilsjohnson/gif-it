const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const { FilePaths } = require('./const');



if (!fs.existsSync(FilePaths.UPLOAD_DIR)) {
    fs.mkdirSync(FilePaths.UPLOAD_DIR);
}

if (!fs.existsSync(FilePaths.GIF_SERVE_DIR)) {
    fs.mkdirSync(FilePaths.GIF_SERVE_DIR);
}

function getExtension(fileName) {
    return path.extname(fileName);
}

function getFileName_noExtension(fileName) {
    return path.parse(fileName).name
}

function getUniqueID() {
    return crypto.randomBytes(6).toString("base64");
  }

exports.getExtension = getExtension;
exports.getFileName_noExtension = getFileName_noExtension;
exports.getUniqueID = getUniqueID;