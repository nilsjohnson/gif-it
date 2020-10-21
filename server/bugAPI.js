const BugReportDAO = require("./data/BugReportDAO");
const { app } = require("./server");

const AuthDAO = require('./data/AuthDAO');
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('./const');
const { getUniqueID } = require("./util/fileUtil");
const log = require('./util/logger');


AWS.config.update({
    region: 'us-east-1'
});

let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

let authDAO = new AuthDAO();
let bugReportDAO = new BugReportDAO();


app.post(`/submitBugReport`, function (req, res) {
    let userId = authDAO.authenticate(req.headers);
    const { message = '', fileInfo = null } = req.body;
    let fileName, report;

    console.log(req.body);

    // database won't reject empty strings, so we check here.
    if (message === '') {
        res.status(400).send();
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
                console.log('Presigning post data encountered an error', err);
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

});

