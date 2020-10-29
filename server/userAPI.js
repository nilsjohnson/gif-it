const { app } = require("./server");
const mediaDAO = require('./data/MediaDAO');
const authDAO = require("./data/AuthDAO");
const { deleteFromS3 } = require("./util/util");
const log = require("./util/logger");

function deleteS3Objects(fileNames) {
    for (let i = 0; i < fileNames.length; i++) {
        console.log(fileNames[i]);
        deleteFromS3(fileNames[i], (result) => {
            // delete from s3 success, do nothing.
        }, (err) => {
            // error deleting from s3
            log(err);
        });
    }
}


app.get('/user/:userId', function (req, res) {
    let userId = req.params.userId;
    console.log("fetching user: " + userId);

    res.status(200).send();
});

app.delete(`/user/deleteMedia/:mId`, function (req, res) {
    let userId = authDAO.authenticate(req.headers);
    let mId = req.params.mId;
    console.log(mId + " delete req.");

    mediaDAO.deleteMediaById(userId, mId, (fileNames) => {
        // query success
        deleteS3Objects(fileNames);
        res.status(200).send();
    }, (err) => {
        // query failure
        log(err);
        res.status(500).send();
    });
});

app.delete(`/user/deleteAlbum/:aId`, function (req, res) {
    let userId = authDAO.authenticate(req.headers);
    let aId = req.params.aId;

    mediaDAO.deleteAlbumById(userId, aId, (fileNames) => {
        deleteS3Objects(fileNames);
        res.status(200).send();
    }, (err) => {
        // failure
        log(err);
        res.status(500).send();
    });
});

