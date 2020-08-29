const moment = require("moment");
const crypto = require("crypto");
const { getDateTime } = require("../util/util");

var mysql = require('mysql');
const { readObj, writeObj } = require("../util/fileUtil");
const { FilePaths } = require("../const");
const log = require("../util/logger");
let pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'gracie',
    password: 'pass123$',
    database: 'gif_it'
});

let tokens = readObj(FilePaths.AUTH_TOKEN_FILE);


function createSalt() {
    return crypto.randomBytes(32).toString("hex");
}

function createNewAuthToken(userId, ipAddr) {
    let token = crypto.randomBytes(32).toString("hex");
    tokens[userId] = { ipAddr: ipAddr, token: token, lastUsed: getDateTime() };
    saveTokens();
    return token;
}

function updateTokenLastUse(userId) {
    tokens[userId].lastUsed = getDateTime();
    saveTokens();
}

function saveTokens() {
    writeObj(tokens, FilePaths.AUTH_TOKEN_FILE);
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

function getAuthToken(nameOrEmail, password, ipAddr) {
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

                let params = [];
                params.push(nameOrEmail);
                params.push(nameOrEmail);

                let getUserSql = `SELECT user_credential.hashed, user_credential.salt, user.id 
                FROM user_credential 
                    JOIN user ON user_credential.id = user.id 
                WHERE user.email = ? OR user.username = ?`;
                connection.query(getUserSql, params, (error, results, fields) => {
                    console.log(error);
                    if (error) {
                        reject(error);
                        return;
                    }

                    let token = null;
                    let userId = null;
                    if (results) {
                        let hash = results[0].hashed;
                        let salt = results[0].salt;
                        userId = results[0].id;
                        if(userId === null) {
                            console.log("UserId is null. This should never happen.");
                        }

                        console.log(hash);
                        console.log(salt);
                        console.log(userId);

                        if (hash === getHash(password, salt)) {
                            // this is a good login attempt
                            token = createNewAuthToken(userId, ipAddr);

                        }
                        else {
                            // this is a bad login attempt
                            log(`Bad login attempt from ${ipAddr}. Invalid Password.`);
                            reject = true;
                        }
                    }
                    else {
                        log(`Bad login attempt from ${ipAddr}. ${nameOrEmail} not found.`);
                        reject = true;
                    }

                    connection.commit(err => {
                        if (err) {
                            connection.rollback();
                            reject(err);
                            return;
                        }
                        else {
                            if (token !== null && userId !== null) {
                                resolve({ token: token, userId: userId });
                            }
                            else {
                                reject("Bad Login Attempt.");
                            }

                        }
                    });
                });
            });
        });
    });
}

function getHash(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}


module.exports = class AuthDAO {
    constructor() {

    }

    createNewUser(firstName, lastName, email, desiredUsername, password) {
        const salt = createSalt();
        const hash = getHash(password, salt);

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

    getAuthToken(nameOrEmail, password, ipAddr) {
        return getAuthToken(nameOrEmail, password, ipAddr);
    }

    authenticate(userId, token, ipAddr) {
        // TODO do we care about the ipAddr actually?
        if (tokens[userId].token !== token) { // && tokens[userId].ipAddr === ipAddr) {
            let str = `Token '${token}' not found.`;
            log(str)
            throw (str)
        }
        else {
            updateTokenLastUse(userId);
        }
    }



}
