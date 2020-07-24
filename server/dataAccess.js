const moment = require("moment");

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'bryn',
    password: 'doggie',
    database: 'gif_it'
});

function getDateTime() {
    let d = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log("right now: ");
    console.log(d);
    return d;
}

function getMostPopularTags(qty, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }
        let sql = `SELECT tag.tag, COUNT(gif_tag.tag_id) as numUses
        FROM tag
            JOIN gif_tag ON tag.id = gif_tag.tag_id
        GROUP BY tag.tag
        ORDER BY numUses desc
        limit ${qty};`;

        connection.query(sql, (error, results, fields) => {
            callback(results);
            connection.release();
            if (error) {
                throw error;
            }
        });
    });
}

function getMostRecent(qty, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }
        let sql = `SELECT gif.id, gif.descript, gif.fileName, gif.thumbName FROM gif
        JOIN upload ON gif.id = upload.id
        ORDER BY upload.date DESC 
        limit ${qty};`;

        connection.query(sql, (error, results, fields) => {
            callback(results);
            connection.release();
            if (error) {
                throw error;
            }
        });
    });
}

function getGifById(gifId, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }
        let sql = `SELECT gif.descript, gif.fileName, JSON_ARRAYAGG(tag.tag) as tags 
        FROM gif
            JOIN gif_tag ON gif.id = gif_tag.gif_id
            JOIN tag ON gif_tag.tag_id = tag.id
        WHERE gif.id = ?`

        connection.query(sql, gifId, (error, results, fields) => {
            callback(results);
            connection.release();
            if (error) {
                throw error;
            }
        });
    });
}


/**
 * This function performs a database transaction to insert a gif into the database. The following 
 * queries execute:
 *  1.) Insert the gif into gif
 *  2.) Insert the upload info into upload
 *  3.) Upsert the tags into tag
 *  4.) retreives all the tag ids from tags inserted in step 3.
 *  5.) Insert new entry into the gif_tag join table
 * 
 * @param {*} uploadId - The id of the gif.
 * @param {*} fileName - The name of the file
 * @param {*} thumbFileName - The name of the file's thumbnail
 * @param {*} tags - Array of tags
 * @param {*} description - description of gif
 * @param {*} ipAddr - uploaders ip address
 * @param {*} originalFileName - The orignal fileName on the client machine
 */
function addGif(uploadId, fileName, thumbFileName, tags, description, ipAddr, originalFileName) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            connection.beginTransaction(function (err) {
                if (err) {
                    console.log(`There was a problem beginning SQL transaction - no attempt to insert gifId ${uploadId} was made.`);
                    console.log(err);
                    return;
                }

                // 1.) insert the gif
                let gif_sql = `INSERT INTO gif SET ?`;
                // let gif_sql = `INSERT INTO gif VALUES('${uploadId}', '${fileName}')`;
                console.log("gif_sql: " + gif_sql);
                let insertObj = { id: uploadId, descript: description, fileName: fileName, thumbName: thumbFileName };
                connection.query(gif_sql, insertObj, (error, results, fields) => {
                    console.log(results);
                    if (error) {
                        reject(error);
                        return;
                    }

                    // 2.) insert the upload
                    let upload_sql = `INSERT INTO upload SET id = ?, date = ?, ipAddr = ?, originalFileName = ?`;
                    console.log("upload_sql: " + upload_sql);
                    connection.query(upload_sql, [uploadId, getDateTime(), ipAddr, originalFileName], (error, results, fields) => {
                        console.log(results);
                        if (error) {
                            reject(err);;
                            return;
                        }

                        // 3.) insert the tags
                        if (!tags) {
                            tags = []; // this is a temp hack..
                        }
                        let tag_str = "";
                        for (let i = 0; i < tags.length; i++) {
                            let tmp = "('" + tags[i] + "')";
                            tag_str += tmp;
                            if (i < tags.length - 1) {
                                tag_str += ", ";
                            }
                        }

                        let tag_sql = `INSERT IGNORE INTO tag (tag) VALUES ${tag_str}`;
                        console.log("tag_sql " + tag_sql);
                        connection.query(tag_sql, (error, results, fields) => {
                            console.log(results);
                            connection.release();
                            if (error) {
                                reject(error);
                                connection.rollback();
                                return;
                            }

                            // 4.) get the tag_ids
                            let tagId_sql = "SELECT tag.id FROM tag WHERE ";
                            let tagIds = [];

                            for (let j = 0; j < tags.length; j++) {
                                tagId_sql += (j === 0 ? "" : " OR ");
                                tagId_sql += `tag.tag = '${tags[j]}'`
                            }

                            connection.query(tagId_sql, function (error, results, fields) {
                                if (error) {
                                    reject(error);
                                    connection.rollback();
                                    return;
                                }

                                console.log("data from tagId_sql");
                                console.log(results);
                                for (let i = 0; i < results.length; i++) {
                                    tagIds.push(results[i].id);
                                }

                                console.log("here are the ids..");
                                console.log(tagIds);

                                // 5.) insert into the gif_tag table

                                let id_tag_str = "";
                                for (let i = 0; i < tags.length; i++) {
                                    let tmp = `('${uploadId}', '${tagIds[i]}')`;
                                    id_tag_str += tmp;
                                    if (i < tags.length - 1) {
                                        id_tag_str += ", ";
                                    }
                                }

                                let gif_tag_sql = `INSERT IGNORE INTO gif_tag (gif_id, tag_id) VALUES ${id_tag_str}`;
                                console.log(gif_tag_sql);
                                connection.query(gif_tag_sql, (error, results, fields) => {
                                    if (error) {
                                        reject(error);
                                        connection.rollback();
                                        return;
                                    }

                                    connection.commit(function (error) {
                                        if (error) {
                                            connection.rollback();
                                            reject(error);
                                            return;
                                        }
                                        else {
                                            resolve("Insertion Completed.");
                                        }

                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}


function getGifsByTag(tags, callback) {
    console.log(tags);
    pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        let getGif_sql =
            "SELECT gif.fileName, gif.descript, gif.thumbName, gif.id from gif \
                JOIN gif_tag ON gif.id = gif_tag.gif_id \
                JOIN tag ON gif_tag.tag_id = tag.id \
            WHERE ";

        for (let i = 0; i < tags.length; i++) {
            getGif_sql += `tag = ?`;
            getGif_sql += (i + 1 < tags.length ? " OR " : " ");
        }

        console.log(`getGif_sql: ${getGif_sql}`);
        connection.query(getGif_sql, tags, (error, results, fields) => {
            console.log(results);
            callback(results);
            connection.release();
            if (error) {
                throw error;
            }
        });
    });
    return [];
}

module.exports.getAllGifs = getMostRecent;
module.exports.addGif = addGif;
module.exports.getGifsByTag = getGifsByTag;
module.exports.getGifById = getGifById;
module.exports.getMostPopularTags = getMostPopularTags;