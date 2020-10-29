const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const { FilePaths } = require('../const');
const log = require('./logger');


if (!fs.existsSync(FilePaths.BASE_DIR)) {
    fs.mkdirSync(FilePaths.BASE_DIR);
}

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

/**
 * @param {*} fileName 
 * @param {*} directory
 * @returns the orginal file, or a new incrimented filename if already existed 
 */
function checkUnique(fileName, directory) {
    let name = path.parse(fileName).name;
    let ext = path.parse(fileName).ext

    let i = 2;
    let file = path.join(directory + "/" + fileName);
    while (fs.existsSync(file)) {
        fileName = `${name} (${i})${ext}`;
        file = path.join(directory + "/" + fileName);
        i++;
    }

    return fileName;
}

/*
Writes object to file as JSON. Async.
*/
function writeObj(obj, name) {
    fs.writeFile(name, JSON.stringify(obj, null, 2), function (err) {
        if (err) {
            log(err);
        }
        else {
            // console.log("file saved!");
        }
    });
}

/**
 * Reads JSON object from file and returns it. Sync.
 * @ return     the object, or an empty object if file doenst exist.
 */
function readObj(name) {
    let obj = {};

    if (!fs.existsSync(name)) {
        console.log(name + " doesnt exist. Returing empty object.");
    }
    else {
        try {
            obj = JSON.parse(fs.readFileSync(name));
        }
        catch (err) {
            console.log(err);
        }
    }

    return obj;
}

/**
 * Deletes a file - Async
 * @param {} path 
 */
function deleteFile(path) {
    if(!path) {
        console.log("Cannot delete file. Path: " + path);
        return;
    }
    fs.unlink(path, (err) => {
        if (err) {
            console.log(err)
        }
    });
}

exports.deleteFile = deleteFile;
exports.writeObj = writeObj;
exports.readObj = readObj;
exports.getExtension = getExtension;
exports.getFileName_noExtension = getFileName_noExtension;
exports.getUniqueID = getUniqueID;
exports.checkUnique = checkUnique;