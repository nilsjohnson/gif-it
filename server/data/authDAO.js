const moment = require("moment");
var mysql = require('mysql');

class AuthDAO {
    constructor() {
        this.pool = mysql.createPool({
            connectionLimit: 10,
            host: 'localhost',
            user: 'gracie',
            password: 'pass123$',
            database: 'gif_it'
        })
    }

    createNewUser(firstName, lastName, email, password) {



    }

  }