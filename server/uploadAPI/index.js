const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const { app, http } = require('../server');
const { FilePaths, MAX_UPLOAD_SIZE } = require('../const');
const { getUniqueID, checkUnique, readObj, writeObj, deleteFile } = require("../util/fileUtil");
const AuthDAO = require('../data/AuthDAO');
const MediaDAO = require('../data/MediaDAO');
const { addJob } = require('../mediaUtil/gifMaker');
const { transferGifToS3, deleteFromS3 } = require('../util/util');
const Upload = require('./Upload');
const Job = require('./Job');
const log = require('../util/logger');

const io = require('socket.io')(http);
io.set('origins', DEV ? 'http://localhost:3000' : 'https://gif-it.io:*');

let authDAO = new AuthDAO();
let mediaDAO = new MediaDAO();

const MAX_TIME_TO_HOLD_FILE = 60 * 60 * 5; // seconds

// the uploads that are not complete
let curUploads = readObj(FilePaths.CURRENT_UPLOADS_FILE);
// the sockets being used for the uploads
let connections = {};

/**
 * Handler for when sockets connect
 */
io.on("connection", (socket) => {
    addSocket(socket);
});

/**
 * adds a socket to sockets and defines it's handlers
 */
function addSocket(socket) {
    let socketId = socket.id;

    socket.on("disconnect", () => {
        deleteSocket(socketId);
    });

    // for when client reconnects after an error
    socket.on('update-socket-id', (data) => {
        console.log('update-socket-id', data);
        const { uploadIds } = data;
        // reassociate each of the clients uploads w/ this socket
        for (let i = 0; i < uploadIds.length; i++) {
            if (curUploads[uploadIds[i]]) {
                curUploads[uploadIds[i]].socketId = socketId;
            }
        }
    });

    socket.on("SuggestTags", (data) => {
        const { uploadId, input } = data;

        mediaDAO.getSuggestedTags(input, (results) => {
            if (results) {
                socket.emit("SuggestionsFound", {
                    uploadId: uploadId,
                    tags: results
                });
            }
        });
    });

    // when the client requests this be converted to gif
    socket.on("convert-requested", (data) => {
        const { uploadId, quality } = data;
        console.log(`Client using socket ${socketId} requesting uploadId ${uploadId} to be converted.`);

        if (curUploads[uploadId]) {
            let job = new Job(
                curUploads[uploadId].uploadDst,
                uploadId,
                quality,
                null,
                onProgress,
                onGifMade,
                onThumbMade
            );
            addJob(job);
        }
        else {
            console.log("didnt find upload: " + uploadId);
        }
    });

    // hold onto this socket
    connections[socketId] = socket;
}

/**
 * Wrapper function to emit from a socket.
 * Finds the appropirate socket for the given upload,
 * then emits the object.
 * @param {*} uploadId 
 * @param {*} event 
 * @param {*} obj 
 */
function emit(uploadId, event, obj) {
    let socketId = curUploads[uploadId].socketId;
    if (connections[socketId]) {
        connections[socketId].emit(event, obj);
    }
    else {
        console.log('cant emiting ' + event);
        console.log(obj);
    }
}

/**
 * Callback for successfully making a gif thumbnail
 * @param {*} uploadId 
 * @param {*} thumbFilePath The location on this machine's disk
 */
function onThumbMade(uploadId, thumbFilePath) {
    transferGifToS3(thumbFilePath,
        (data) => {
            // if success
            console.log(`Thumbnail s3 transfer success: ${data}`);
        }),
        (err) => {
            // if failure
            console.log(`Thumbnail s3 transfer failed: ${err}`);
        };
}

/**
 * Call back for when a gif has been made.
 * Note that the thumbnail may not yet be made,
 * but we know where it will be.
 * @param {*} uploadId 
 * @param {*} gifFilePath location on disk of the gif
 * @param {*} thumbFilePath location on disc of the thumbnail
 */
function onGifMade(uploadId, gifFilePath, thumbFilePath, message = null) {
    if(gifFilePath === null || thumbFilePath === null) {
        emit(uploadId, 'err', {
            uploadId: uploadId,
            err : message 
        });
        return;
    }

    curUploads[uploadId].fileName = path.basename(gifFilePath);
    curUploads[uploadId].thumbFileName = path.basename(thumbFilePath);
    curUploads[uploadId].gifFilePath = gifFilePath;
    curUploads[uploadId].thumbFilePath = thumbFilePath;
    saveUploads();

    // send to s3. Note the thumbnail is still  
    // being generated, so we dont send that yet.
    transferGifToS3(gifFilePath,
        (data) => {
            // on success
            emit(uploadId, 'conversion-complete', {
                uploadId: uploadId,
                fileName: curUploads[uploadId].fileName,
                thumbName: curUploads[uploadId].thumbFileName
            });
        },
        (err) => {
            // on failure
            log(err);

        });
}

/**
 * Removes uploads from curUploads that are more
 * than MAX_TIME_TO_HOLD_FILE seconds old.
 */
function cleanUploads() {
    let now = new Date().getTime();
    for (const key in curUploads) {
        if (now - curUploads[key].uploadTime > MAX_TIME_TO_HOLD_FILE * 1000) {
            deleteUploadFromDisk(key);
            deleteUploadFromS3(key);
            delete curUploads[key];
        }
    }
}

/**
 * Writes the curUploads to disk
 */
function saveUploads() {
    writeObj(curUploads, FilePaths.CURRENT_UPLOADS_FILE);
}

/**
 * Cleans curUploads, then adds a new one, then saves it to disk.
 * @param {*} uploadId 
 * @param {*} socketId 
 * @param {*} uploadDst Where the upload file is saved on this machine
 * @param {*} givenFileName What the user called the file on their machine
 * @param {*} ipAddr The user's IP address
 * @param {*} userId 
 */
function addUpload(uploadId, socketId, uploadDst, givenFileName, ipAddr, userId) {
    cleanUploads();
    let upload = new Upload(
        uploadId,
        socketId,
        uploadDst,
        givenFileName,
        ipAddr,
        userId
    );
    curUploads[uploadId] = upload;
    saveUploads();
}

/**
 * deletes a socket by its id;
 */
function deleteSocket(socketId) {
    return delete connections[socketId];
}

/**
 * Emits conversion progress data
 * @param {*} data 
 */
function onProgress(data) {
    emit(data.uploadId, 'conversion-progress', data);
}

function deleteUploadFromDisk(uploadId) {
    console.log(`deleting ${uploadId} from server.`);
    console.log(curUploads);

    // delete the orignal file
    deleteFile(curUploads[uploadId].uploadDst);
    // delete the gif
    deleteFile(curUploads[uploadId].gifFilePath);
    // delete the thumbnail
    deleteFile(curUploads[uploadId].thumbFilePath);

    delete curUploads[uploadId];
}

function deleteUploadFromS3(uploadId) {
    // remove these from s3
    if(!curUploads[uploadId]) {
        return;
    }
    if (curUploads[uploadId].fileName) {
        deleteFromS3(curUploads[uploadId].fileName, () => {
            // success
            console.log(curUploads[uploadId].fileName + ' deleted');
        }, (err) => {
            // fail
            console.log(err);
        });
    }
    if (curUploads[uploadId].thumbFileName) {
        deleteFromS3(curUploads[uploadId].thumbFileName, () => {
            // success
            console.log(curUploads.thumbFilePath + ' deleted');
        }, (err) => {
            // fail
            console.log(err);
        });
    }
}

/**
 * Performs cleanup of gifs and original uploads.
 * Call upon sharing media - All media should be on s3 at this point.
 * @param {*} uploadId 
 */
function onShare(uploadId) {
    if (curUploads[uploadId]) {
        deleteUploadFromDisk(uploadId);
        delete curUploads[uploadId];
        saveUploads();
    }
}

/**
 * API endpoint for uploading media.
 */
app.post('/upload/:socketId/:tempUploadId/:action', function (req, res) {
    let userId = authDAO.authenticate(req.headers);
    if (!userId) {
        console.log("Sending Redirect.");
        res.redirect('/login');
        return;
    }

    let socketId = req.params.socketId;
    let tempUploadId = req.params.tempUploadId;
    let action = req.params.action;
    let bytesRecieved = 0;
    let fileSize = req.headers["content-length"];
    let uploadDst;
    let fileName;
    let uploadId = getUniqueID();
    let ipAddr = req.ip;

    // validaion size
    if (fileSize / (1000 * 1000).toFixed(2) > MAX_UPLOAD_SIZE) {
        console.log(`Chosen file is ${fileSize / (1000 * 1000).toFixed(2)} MB, while ${MAX_UPLOAD_SIZE} MB is the maximum. Returning 400..`);
        res.status(400).send({ error: `File Too Large. Max Size: ${MAX_UPLOAD_SIZE} Mb.` });
        return;
    }
    else {
        let busboy = new Busboy({ headers: req.headers });

        busboy.on('file', function (fieldName, file, givenFileName, encoding, mimetype) {
            // set the fileName
            fileName = checkUnique(givenFileName, FilePaths.UPLOAD_DIR);
            // set the upload dst
            uploadDst = path.join(FilePaths.UPLOAD_DIR + "/" + fileName);
            // add the upload
            addUpload(uploadId, socketId, uploadDst, givenFileName, ipAddr, userId, action);

            emit(uploadId, 'upload-start', {
                uploadId: uploadId,
                tempUploadId: tempUploadId
            });

            file.on('data', function (data) {
                bytesRecieved = bytesRecieved + data.length;
                let prevPercent = curUploads[uploadId].percentUploaded;
                curUploads[uploadId].percentUploaded = Math.round(bytesRecieved * 100 / fileSize);

                // only send progress if it's changed.
                if (prevPercent !== curUploads[uploadId].percentUploaded) {
                    emit(uploadId, 'upload-progress', {
                        uploadId: uploadId,
                        percentUploaded: curUploads[uploadId].percentUploaded
                    });
                }
            });

            file.pipe(fs.createWriteStream(uploadDst));
        });

        busboy.on('finish', function () {
            curUploads[uploadId].percentUploaded = 100;
            saveUploads();

            // finish was called so upload was success.
            res.writeHead(200, { 'Connection': 'close' });
            res.end();
        });

        return req.pipe(busboy);
    }
});

/**
 * API endpoint for sharing media.
 */
app.post('/upload/addMedia', function (req, res) {
    let userId = authDAO.authenticate(req.headers);
    if (!userId) {
        console.log("Sending Redirect.");
        res.redirect('/login');
        return;
    }

    console.log(req.body);

    if (req.body.album) {
        // if this is an 'album' of items
        let album = req.body.album;

        for (let i = 0; i < album.items.length; i++) {
            onShare(album.items[i].uploadId);
        }

        mediaDAO.createAlbum(album, userId, req.ip, (albumId) => {
            // on success
            console.log("Album created!");
            res.send({ redirect: `/explore?albumId=${albumId}` });
        }, err => {
            // on error
            console.log(err);
            res.sendStatus(500);
        });
    }
    else if (req.body.media) {
        // if this is just a single item
        let media = req.body.media;
        onShare(media.uploadId);

        mediaDAO.addMedia(media, userId, req.ip, mediaId => {
            // on success
            res.send({ redirect: `/explore?mId=${mediaId}` });
        }, err => {
            // on error
            console.log(err);
            res.sendStatus(500);
        });
    }
});
