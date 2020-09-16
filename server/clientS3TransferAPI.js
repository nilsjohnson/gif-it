const { app, http } = require('./server');
const {  MAX_UPLOAD_SIZE } = require('./const');
const AuthDAO = require('./data/AuthDAO');
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('./const');
const { getUniqueID } = require("./util/fileUtil");
const log = require('./util/logger');

let authDAO = new AuthDAO();

AWS.config.update({
    region: 'us-east-1'
});


app.post('/getPresignedPost', (req, res) => {
    let userId = authDAO.authenticate(req.headers);
    if (!userId) {
        console.log("Sending Redirect.");
        res.redirect('/login');
        return;
      }

    let s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    
    if(DEBUG) {
        console.log("getPresignedPost hit. Body:");
        console.log(req.body);
    }

    let action = req.body.action;
    let key;
    let contentType;
    let uploadId;

    if(action === 'speed_test') {
        key = 'speedtest.txt';
        contentType = 'text/plain';
        uploadId = "";
    }
    else {
        let fileExt = req.body.fileType;
        fileExt = fileExt.toLowerCase();
        
        uploadId = getUniqueID();
        key = `${uploadId}.${req.body.fileType}`;
        contentType = 'image/jpg';
    }

    var params = {
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
            if(DEBUG) { console.log(`The post data for signedPost: ${data}`);}       
            console.log(data);
            res.json({
                url: data.url,
                fields: data.fields,
                uploadId: uploadId
            });
        }
    });
});
