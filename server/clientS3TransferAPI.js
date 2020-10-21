const { app, http } = require('./server');
const { MAX_UPLOAD_SIZE } = require('./const');
const AuthDAO = require('./data/AuthDAO');
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('./const');
const { getUniqueID } = require("./util/fileUtil");
const log = require('./util/logger');

let authDAO = new AuthDAO();

AWS.config.update({
    region: 'us-east-1'
});

let s3 = new AWS.S3({ apiVersion: "2006-03-01" });


app.post('/getPresignedPost', (req, res) => {
    let userId = authDAO.authenticate(req.headers);
    if (!userId) {
        console.log("Sending Redirect.");
        res.redirect('/login');
        return;
    }

    if (DEBUG) {
        console.log("getPresignedPost hit. Body:");
        console.log(req.body);
    }

    let action = req.body.action;
    let key;
    let contentType;

    

    if (action === 'speed_test') {
        key = 'speedtest.txt';
        contentType = 'text/plain';
        uploadId = "";

        let params = {
            Bucket: BUCKET_NAME,
            Fields: {
                key: key,
                ContentType: contentType,
                ACL: 'public-read'
            },
            Conditions: [
                ["content-length-range", 0, 1_000_000 * MAX_UPLOAD_SIZE]
            ]
        };

        s3.createPresignedPost(params, (err, data) => {
            if (err) {
                log('Presigning post data encountered an error', err);
                res.send(500);
            } else {
                if (DEBUG) { console.log(`The post data for signedPost: ${data}`); }
                console.log(data);
                res.json({
                    url: data.url,
                    fields: data.fields
                });
            }
        });
    }
    else if (action === "photo") {
        let fileExt = req.body.fileType;
        fileExt = fileExt.toLowerCase();
        let uploadId = getUniqueID();

        // for the web-sized photo
        let photoParams = {
            Bucket: BUCKET_NAME,
            Fields: {
                key: `${uploadId}.${fileExt}`,
                ACL: 'public-read',
                'Content-Type': 'image/jpeg'
            },
            Conditions: [
                ["content-length-range", 0, 1_000_000 * MAX_UPLOAD_SIZE]
            ]
        };

        // for the thumbnail
        let thumbnailParams = {
            Bucket: BUCKET_NAME,
            Fields: {
                key: `${uploadId}.thumb.${fileExt}`,
                ACL: 'public-read',
                'Content-Type': 'image/jpeg'
            },
            Conditions: [
                ["content-length-range", 0, 1_000_000 * MAX_UPLOAD_SIZE]
            ]
        };

        // for the full-size render
        let fullSizeParams = {
            Bucket: BUCKET_NAME,
            Fields: {
                key: `${uploadId}.max.${fileExt}`,
                ACL: 'public-read',
                'Content-Type': 'image/jpeg'
            },
            Conditions: [
                ["content-length-range", 0, 1_000_000 * MAX_UPLOAD_SIZE]
            ]
        };

        s3.createPresignedPost(photoParams, (err, webSizePhotoData) => {
            if (err) {
                log(err);
                res.send(500);
            }
            else {
                s3.createPresignedPost(thumbnailParams, (err, thumbSizePhotoData) => {
                    if (err) {
                        log(err);
                        res.send(500);
                    }
                    else {
                        s3.createPresignedPost(fullSizeParams, (err, fullSizePhotoData) => {
                            if(err) {
                                log(err)
                            }
                            else {
                                // Success! Go team!
                                let obj = {
                                    // TODO, uhhh? unwrap these?
                                    uploadId: uploadId,
                                    webSizePhotoData: {
                                        url: webSizePhotoData.url,
                                        fields: webSizePhotoData.fields,
                                    },
                                    thumbSizePhotoData: {
                                        url: thumbSizePhotoData.url,
                                        fields: thumbSizePhotoData.fields
                                    },
                                    fullSizePhotoData: {
                                        url: fullSizePhotoData.url,
                                        fields: fullSizePhotoData.fields
                                    }
                                };
                                console.log("sending back presigned info: ");
                                console.log(obj);
                                res.json(obj);
                            }
                        });
                    }
                });
            }
        });
    }
});
