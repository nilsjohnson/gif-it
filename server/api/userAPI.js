const { app } = require("../server");
const mediaDAO = require('../data/MediaDAO');
const authDAO = require("../data/AuthDAO");
const userDAO = require('../data/UserDAO');
const { deleteFromS3 } = require("../util/util");
const log = require("../util/logger");

/**
 * Deletes objects from S3
 * @param {*} fileNames the object keys
 */
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

/**
 * Returns media to the client by their us ID, as found when authenticating.
 */
app.get(`/user/media`, function (req, res) {
    authDAO.authenticate(req.headers).then(userId => {
        // note we dont use the userDAO here
        mediaDAO.getMediaByUserId(userId, (media) => {
            // success
            res.json(media);
        }, err => {
            // media error
            log(err);
            // TODO figure out actual error
            res.status(500).send();
        })
    }).catch(err => {
        // auth error
        res.status(400).send();
    })
});

/**
 * Deletes a media item by it id.
 */
app.delete(`/user/deleteMedia/:mId`, function (req, res) {
    let mId = req.params.mId;
    console.log(mId + " delete req.");

    authDAO.authenticate(req.headers).then(userId => {
        userDAO.deleteMediaById(userId, mId, (fileNames) => {
            // query success
            deleteS3Objects(fileNames);
            res.status(200).send();
        }, (err) => {
            // query failure
            log(err);
            res.status(500).send();
        });
    }).catch(err => {
        log(err);
        res.status(401).send();
    });
});

/**
 * Deletes an album by its id.
 */
app.delete(`/user/deleteAlbum/:aId`, function (req, res) {
    let aId = req.params.aId;
    authDAO.authenticate(req.headers).then(userId => {
        userDAO.deleteAlbumById(userId, aId, (fileNames) => {
            deleteS3Objects(fileNames);
            res.status(200).send();
        }, (err) => {
            // failure
            log(err);
            res.status(500).send();
        });

    }).catch(err => {
        log(err);
        res.status(401).send();
    })
});

app.post(`/user/updateDescription`, function (req, res) {
    console.log(req.body);

    const { mId, description } = req.body;

    authDAO.authenticate(req.headers).then(userId => {
        userDAO.updateMediaDescription(userId, mId, description, () => {
            // success
            res.status(200).send();
        }, (err) => {
            // err
            log(err);
            res.status(500).send();
        });
    }).catch(err => {
        log(err);
        res.status(401).send();
    });
});

app.post(`/user/addTags/`, function(req, res) {
    console.log(req.body);

    const { mId, tags } = req.body;

    authDAO.authenticate(req.headers).then(userId => {
        userDAO.addTags(userId, mId, tags, () => {
            // success
            res.status(200).send();
        }, (err) => {
            // err
            log(err);
            res.status(500).send();
        });
    }).catch(err => {
        log(err);
        res.status(401).send();
    });
});


app.post(`/user/removeTags/`, function(req, res) {
    console.log(req.body);

    const { mId, tags } = req.body;

    authDAO.authenticate(req.headers).then(userId => {
        userDAO.deleteTags(userId, mId, tags, () => {
            // success
            res.status(200).send();
        }, (err) => {
            // err
            log(err);
            res.status(500).send();
        });
    }).catch(err => {
        log(err);
        res.status(401).send();
    });
});