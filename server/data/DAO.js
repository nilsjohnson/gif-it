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

    /**
 * executes sql
 * @param {*} connection mysql connection
 * @param {*} sql sql string
 * @param {*} args argumentd
 */
    query(connection, sql, args = {}) {
        return new Promise((resolve, reject) => {
            connection.query(sql, args, (err, results, fields) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        }).catch(err => {
            console.log("throwing.");
            throw (err);
        });
    }

    /**
     * starts a transaction on the given connection
     * @param {*} connection 
     */
    startTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.beginTransaction(err => {
                if (err) {
                    reject("err");
                    return;
                }
                resolve(true);
            });
        }).catch(err => {
            throw (err);
        });
    }

    /**
     * commits a transaction on the given connection
     * @param {*} connection 
     */
    completeTransation(connection) {
        return new Promise((resolve, reject) => {
            connection.commit(err => {
                if (err) {
                    reject(error);
                    return;
                }
                resolve(true);
            });
        }).catch(err => {
            throw (err);
        });
    }
}

