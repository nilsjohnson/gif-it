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



module.exports.getAllGifs = getAllGifs;
module.exports.addGif = addGif;
module.exports.addTags = addTags;
module.exports.addGifTags = addGifTags;