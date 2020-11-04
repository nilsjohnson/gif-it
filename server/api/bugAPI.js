const bugReportDAO = require("../data/BugReportDAO");
const { app } = require("../server");

const authDAO = require('../data/AuthDAO');
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('../const');
const { getUniqueID } = require("../util/fileUtil");
const log = require('../util/logger');

AWS.config.update({
    region: 'us-east-1'
});

let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

/**
 * API endpoint for submitting a bug report.
 * Inserts bug report into db and creates a signed S3 post 
 * if the user has a file associated with report.
 * User does not have to be authenticated to submit reports.
 */
app.post(`/submitBugReport`, function (req, res) {
    const { message = '', fileInfo = null } = req.body;
    
    authDAO.authenticate(req.headers).then(userId => {
        // this is an authenticated user.
        insertBugReport(userId, res, message, fileInfo);
    }).catch(err => {
        // this is not an authenticated user
        log(err);
        insertBugReport(null, res, message, fileInfo);
    });
});

// helper function for inserting reports.
function insertBugReport(userId, res, message, fileInfo) {
    let fileName, report;
    // database won't reject empty strings, so we check here.
    if (message === '') {
        res.status(400).send();
        return;
    }

    // if there is a file associated with this bug report
    if (fileInfo && fileInfo.fileName && fileInfo.fileType) {
        fileName = `${getUniqueID()}.bug.${fileInfo.fileType}`;

        let params = {
            Bucket: BUCKET_NAME,
            Expires: 60 * 30,
            Fields: {
                key: fileName,
                ACL: 'public-read'
            },
            Conditions: [
                ["content-length-range", 0, 1_000_000 * 20]
            ]
        };

        s3.createPresignedPost(params, (err, data) => {
            if (err) {
                log(err);
            }
            else {
                report = {
                    user_id: userId,
                    message: message,
                    fileName: fileName
                }

                bugReportDAO.addBugReport(report, () => {
                    // on success
                    if (data) {
                        console.log("this file is called: ", fileName);
                        res.json(data);
                    }
                    else {
                        res.json({ result: "Success" });
                    }

                }, (err) => {
                    // on fail
                    log(err);
                    res.status(500).send();
                });
            }
        });
    }
    // just insert the message
    else {
        report = {
            user_id: userId,
            message: message.trim(),
            fileName: fileName
        }

        bugReportDAO.addBugReport(report, () => {
            // on success
            res.json({ result: "Success" });
        }, (err) => {
            // on fail
            res.status(500).send();
        });
    }
}

