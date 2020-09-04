var mysql = require('mysql');
const log = require('../util/logger');
const { getTimeStamp } = require('../util/util');

module.exports = class DAO {
    constructor(maxConnections, host, user, password, database) {

        this.pool = mysql.createPool({
            connectionLimit: maxConnections,
            host: host,
            user: user,
            password: password,
            database: database
        });

    }

    logFailure(err) {
        log(err);
    }

    /**
     * Provides a database connection
     * @param {*} onConnect Callback providing the connection on success, or null on failure.
     */
    getConnection(onConnect) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                this.logFailure(err);
                connection = null;
            }
            return onConnect(connection);
        });
    }

    getTimeStamp() {
        // this refers to the function in the util.js file
        return getTimeStamp();
    }
}