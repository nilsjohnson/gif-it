// This script compares all s3 objects to whats in the gif table and delete the *.gif files that are not referenced.

const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('../const');
AWS.config.update({ region: 'us-east-1' })
let s3 = new AWS.S3({ apiVersion: "2006-03-01" });
var path = require('path');

const DRY = true;
global.DEBUG = true;

var mysql = require('mysql');
const { deleteFromS3 } = require('./util');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'bryn',
    password: 'doggie',
    database: 'gif_it'
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});


connection.query('SELECT fileName, thumbName FROM gif', function (error, referencedGifs, fields) {
    if (error) {
        console.log(error);
    }
    else {
        // alright, lets do it!
        // console.log("here are all the gifs....")
        // for (let i = 0; i < referencedGifs.length; i++) {
        //     console.log(referencedGifs[i].fileName);
        //     console.log(referencedGifs[i].thumbName);
        // }

        let opts = { Bucket: BUCKET_NAME };
        let allObjects = [];
        let allGifs = [];
        let toDelete = [];

        s3.listObjectsV2(opts, function (err, data) {
            if(err) {
                console.log(err);
                return;
            }

            allObjects = data.Contents;  

            for(let i = 0; i < allObjects.length; i++) {
                let ext = path.extname(allObjects[i].Key);
                let fileName = allObjects[i].Key;
                if(ext === '.gif') {
                    allGifs.push(fileName);
                }
                else {
                    //console.log(`${fileName} is not a gif`);
                }
            }      
            
            for(let i = 0; i < allGifs.length; i++) {
                let isReferenced = false;
                for(let j = 0; j < referencedGifs.length; j++) {
                    //console.log(`comparing ${allGifs[i]} and ${referencedGifs[j].fileName}`)
                    if(allGifs[i] === referencedGifs[j].fileName) {
                        isReferenced = true;
                        break;
                    }
                    if(allGifs[i] === referencedGifs[j].thumbName) {
                        isReferenced = true;
                        break;
                    }
                }

                if(!isReferenced) {
                    toDelete.push(allGifs[i]);
                }

            }

            console.log(`There are a total of ${allGifs.length} gifs.`);
            console.log(`There are a total of ${toDelete.length} unreferenced gifs.`);

            for(let i = 0; i < toDelete.length; i++) {
                //console.log(`${toDelete[i]} will be deleted.`);
                
                if(!DRY) {
                    deleteFromS3(toDelete[i]);
                }
            }

        });

        connection.end();

    }
});