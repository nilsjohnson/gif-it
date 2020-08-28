const moment = require("moment");
const crypto = require("crypto");
const { getDateTime } = require("../util/util");

var mysql = require('mysql');
let pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'gracie',
    password: 'pass123$',
    database: 'gif_it'
});

function createSalt() {
    return crypto.randomBytes(32).toString("hex");
}

function AddUser(user, credentials) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    reject(err)
                    return;
                }

                // 1.) insert the user
                let userSql = `INSERT INTO user SET ?`;
                connection.query(userSql, user, (error, results, fields) => {
                    console.log(results);
                    if (error) {
                        reject(error);
                        return;
                    }

                    // 2.) get id
                    let getIdSql = 'SELECT LAST_INSERT_ID() as id';
                    connection.query(getIdSql, (err, results, fields) => {
                        if (err) {
                            reject(err);
                        }

                        let userId = results[0].id;
                        credentials.id = userId;

                        // 2.) insert the credentials
                        let credSql = `INSERT INTO user_credential SET ?`
                        connection.query(credSql, credentials, (error, results, fields) => {
                            console.log(results);
                            if (error) {
                                reject(error);
                                return;
                            }

                            connection.commit(err => {
                                if (err) {
                                    connection.rollback();
                                    reject(err);
                                    return;
                                }
                                else {
                                    resolve(userId);
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}

module.exports = class AuthDAO {
    constructor() {

    }

    createNewUser(firstName, lastName, email, password, desiredUsername) {
        const salt = createSalt();
        const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

        let newUser = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            active: 1,
            signupDate: getDateTime(),
            username: desiredUsername
        };

        let credential = {
            hashed: hash,
            salt: salt
        };

        return AddUser(newUser, credential);
    }



}
