var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'bryn',
    password: 'doggie',
    database: 'gif_it'
});

function getAllGifs(callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }
        connection.query('SELECT * FROM gif', (error, results, fields) => {
            callback(results);
            connection.release();
            if (error) {
                throw error;
            }
        });
    });
    return [];
}

function addGif(id, filename) {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        // insert the gif
        let gif_sql = `INSERT INTO gif VALUES('${id}', '${filename}')`;
        console.log("sql " + gif_sql);
        connection.query(gif_sql, (error, results, fields) => {
            console.log(results);
            connection.release();
            if (error) {
                console.log(error);
            }
        });
    });
}


function addTags(tags, uploadId) {
    pool.getConnection((err, connection) => {
        // TODO handle this error..and for other methods as well
        if (err) {
            console.log("problem w/ connection");
            console.log(err);
        }

        let tag_str = "";
        for (let i = 0; i < tags.length; i++) {
            let tmp = "('" + tags[i] + "')";
            tag_str += tmp;
            if (i < tags.length - 1) {
                tag_str += ", ";
            }
        }

        let gif_sql = `INSERT IGNORE INTO tag (tag) VALUES ${tag_str}`;
        console.log("sql " + gif_sql);
        connection.query(gif_sql, (error, results, fields) => {
            console.log(results);
            connection.release();
            if (error) {
                console.log(error);
            }
        });
    });
}

function addGifTags(gifId, tags) {
    for (let i = 0; i < tags.length; i++) {
        pool.getConnection((err, connection) => {
            // TODO handle this error..and for other methods as well
            if (err) {
                console.log("problem w/ connection");
                console.log(err);
            }

            let tag = tags[i];
            let gif_tag_sql =
                `INSERT INTO gif_tag VALUES('${gifId}', (SELECT tag.id FROM tag WHERE tag.tag = '${tag}'))`;
            console.log("sql " + gif_tag_sql);
            connection.query(gif_tag_sql, (error, results, fields) => {
                console.log(results);
                connection.release();
                if (error) {
                    console.log(error);
                }
            });
        });
    }
}

function addGif_2(gifId, fileName, tags) {
    pool.getConnection((err, connection) => {
        connection.beginTransaction(function (err) {
            if (err) {
                console.log(err);
            }

            // insert the gif
            let gif_sql = `INSERT INTO gif VALUES('${gifId}', '${fileName}')`;
            console.log("gif_sql: " + gif_sql);
            connection.query(gif_sql, (error, results, fields) => {
                console.log(results);
                if (error) {
                    console.log(error);
                }

                // insert the tags
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
                        console.log(error);
                    }

                    // get the tag_ids
                    let tagId_sql = "SELECT tag.id FROM tag WHERE ";
                    let tagIds = [];

                    for (let j = 0; j < tags.length; j++) {
                        tagId_sql += (j === 0 ? "" : " OR ");
                        tagId_sql += `tag.tag = '${tags[j]}'`
                    }

                    connection.query(tagId_sql, function (error, results, fields) {
                        if (error) {
                            console.log(error); // rollback too...?
                        }

                        console.log("data from tagId_sql");
                        console.log(results);
                        for (let i = 0; i < results.length; i++) {
                            tagIds.push(results[i].id);
                        }

                        console.log("here are the ids..");
                        console.log(tagIds);

                        // insert into the gif_tag table

                        let id_tag_str = "";
                        for (let i = 0; i < tags.length; i++) {
                            let tmp = `('${gifId}', '${tagIds[i]}')`;
                            id_tag_str += tmp;
                            if (i < tags.length - 1) {
                                id_tag_str += ", ";
                            }
                        }

                        let gif_tag_sql = `INSERT IGNORE INTO gif_tag (gif_id, tag_id) VALUES ${id_tag_str}`;
                        console.log(gif_tag_sql);
                        connection.query(gif_tag_sql, (error, results, fields) => {
                            if(error) {
                                console.log(error);
                            }

                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function () {
                                        throw err;
                                    });
                                }
                                console.log('success!');
                            });
                        });
                    });
                });
            });
        });
    });
}

module.exports.getAllGifs = getAllGifs;
module.exports.addGif = addGif;
module.exports.addTags = addTags;
module.exports.addGifTags = addGifTags;
module.exports.addGif_2 = addGif_2;