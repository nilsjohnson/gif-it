var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 1,
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
        let sql = `INSERT INTO gif values('${id}', '${filename}')`;
        console.log("sql " + sql);
        connection.query(sql , (error, results, fields) => {
            console.log(results);
            connection.release();
            if (error) {
                throw error;
            }
        });
    });
    return [];
}

module.exports.getAllGifs = getAllGifs;
module.exports.addGif = addGif;