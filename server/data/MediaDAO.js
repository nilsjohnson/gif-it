const DAO = require("./DAO");
const log = require("../util/logger");

// var mysql = require('mysql');
// var pool = mysql.createPool({
//     connectionLimit: 10,
//     host: 'localhost',
//     user: 'bryn',
//     password: 'doggie',
//     database: 'gif_it'
// });


class MediaDAO extends DAO {
    constructor() {
        //maxConnections, host, user, password, database
        super(10, 'localhost', 'bryn', 'doggie', 'gif_it');
    }

    /**
     * Fetches the popular tags
     * @param {*} qty 
     * @param {*} callback callback method that takes an array of strings
     */
    getMostPopularTags(qty, callback) {
        this.getConnection(connection => {
            if(!connection) { 
                callback(null);
                return; 
            }

            let sql = `SELECT tag.tag, COUNT(gif_tag.tag_id) as numUses
                FROM tag
                    JOIN gif_tag ON tag.id = gif_tag.tag_id
                GROUP BY tag.tag
                ORDER BY numUses desc
                limit ${qty};`;

            connection.query(sql, (error, results, fields) => {
                connection.release();
                callback(results);
                if (error) {
                    this.logFailure(error);
                }
            });
        });
    }

    /**
     * Gets the most recent uploads
     * @param {*} qty 
     * @param {*} callback callback method that returns an array of objects
     */
    getMostRecent(qty, callback) {
        this.getConnection(connection => {
            if(!connection) {
                return callback(null);
            }

            let sql = `SELECT gif.id, gif.descript, gif.fileName, gif.thumbName FROM gif
            JOIN upload ON gif.id = upload.id
            ORDER BY upload.date DESC 
            limit ${qty};`;

            connection.query(sql, (error, results, fields) => {
                connection.release();
                callback(results);
                if (error) {
                    this.logFailure(error);
                }
            });
        });
    }

    /**
     * Gets a gif by its id
     * @param {*} gifId 
     * @param {*} callback callback function that takes an object
     */
    getGifById(gifId, callback) {
        this.getConnection( connection => {
            if (!connection) {
                return callback(null);
            }

            let sql = `SELECT 
            gif.descript, 
            gif.fileName, 
            JSON_OBJECTAGG(tag.tag, 
                (SELECT COUNT(gif_tag.tag_id)
                    FROM gif_tag
                    WHERE gif_tag.tag_id = tag.id)) as tags 
            FROM gif
                JOIN gif_tag ON gif.id = gif_tag.gif_id
                JOIN tag ON gif_tag.tag_id = tag.id
            WHERE gif.id = ?`;


            connection.query(sql, gifId, (error, results, fields) => {
                callback(results);
                connection.release();
                if (error) {
                    this.logFailure(error);
                }
            });
        });
    }

    /**
     * Query to get suggested tags a user enters input
     * @param {*} input     what the user has typed
     * @param {*} callback  callback function that takes an array of strings
     * @param {*} limit     the max number of suggestions to return
     */
    getSuggestedTags(input, callback, limit = 3) {
        this.getConnection(connection => {
            if (!connection) {
                return callback(null);
            }

            let sql = `SELECT tag.tag, COUNT(gif_tag.tag_id) as numUses
            FROM tag
                JOIN gif_tag ON tag.id = gif_tag.tag_id
            WHERE tag.tag LIKE '${input}%' 
            GROUP BY tag.tag
            ORDER BY numUses desc
            limit ${limit}`;

            connection.query(sql, (error, results, fields) => {
                callback(results);
                connection.release();

                if (error) {
                    this.logFailure(error);
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
     * @returns A promise
     */
    addGif(uploadId, fileName, thumbFileName, tags, description, ipAddr, originalFileName) {
        let uploadTime = this.getTimeStamp();

        return new Promise((resolve, reject) => {
            if(!tags) {
                reject("At least one tag is required.");
            }

            this.getConnection(connection => {
                if(!connection) {
                    reject("Database Error");
                    return;
                }


                connection.beginTransaction(function (err) {
                    if (err) {
                        this.logFailure(err);
                        reject("Database Error");
                        return;
                    }

                    // 1.) insert the gif
                    let gif_sql = `INSERT INTO gif SET ?`;
                    let insertObj = { id: uploadId, descript: description, fileName: fileName, thumbName: thumbFileName };
                    connection.query(gif_sql, insertObj, (error, results, fields) => {
                        if (error) {
                            reject("Database Error");
                            this.logFailure(error)
                            return;
                        }

                        // 2.) insert the upload
                        let upload_sql = `INSERT INTO upload SET id = ?, date = ?, ipAddr = ?, originalFileName = ?`;
                        connection.query(upload_sql, [uploadId, uploadTime, ipAddr, originalFileName], (error, results, fields) => {
                            if (error) {
                                this.logFailure(error);
                                reject("Database Error");;
                                return;
                            }

                            // 3.) insert the tags
                            let tag_str = "";
                            for (let i = 0; i < tags.length; i++) {
                                let tmp = "('" + tags[i] + "')";
                                tag_str += tmp;
                                if (i < tags.length - 1) {
                                    tag_str += ", ";
                                }
                            }

                            let tag_sql = `INSERT IGNORE INTO tag (tag) VALUES ${tag_str}`;
                            connection.query(tag_sql, (error, results, fields) => {
                                if (error) {
                                    connection.rollback();
                                    reject(error);
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
                                        connection.rollback();
                                        reject(error);
                                        return;
                                    }

                                    for (let i = 0; i < results.length; i++) {
                                        tagIds.push(results[i].id);
                                    }

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
                                    connection.query(gif_tag_sql, (error, results, fields) => {
                                        if (error) {
                                            connection.rollback();
                                            reject(error);
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

/**
 * Finds all gifs with the given tags
 * @param {*} tags 
 * @param {*} callback a function that takes an array of gif objects
 */
    getGifsByTag(tags, callback) {
        this.getConnection(connection => {
            if (!connection) {
                return callback(null);
            }

            let getGif_sql =
                "SELECT distinct gif.fileName, gif.descript, gif.thumbName, gif.id from gif \
                    JOIN gif_tag ON gif.id = gif_tag.gif_id \
                    JOIN tag ON gif_tag.tag_id = tag.id \
                WHERE ";

            for (let i = 0; i < tags.length; i++) {
                getGif_sql += `tag = ?`;
                getGif_sql += (i + 1 < tags.length ? " OR " : " ");
            }

            connection.query(getGif_sql, tags, (error, results, fields) => {
                connection.release();
                callback(results);
                if (error) {
                    this.logFailure(error);
                }
            });
        });
    }


}

module.exports = MediaDAO;