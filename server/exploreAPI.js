var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 1,
    host     : 'localhost',
    user     : 'bryn',
    password : 'doggie',
    database : 'gif_it'
  });

const { app } = require("./server");
const { getAllGifs } = require('./dataAccess');


app.get('/api/explore', function (req, res) {
    getAllGifs(result => res.send(result));
});
