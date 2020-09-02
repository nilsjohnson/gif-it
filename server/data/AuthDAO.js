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

/**
 * An object that maps auth tokens to userIds, dates last used, and last used ipAddr
 */
let tokens = readObj(FilePaths.AUTH_TOKEN_FILE);

/**
 * @returns a 32 byte random string of hex digits
 */
function createSalt() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Makes a new auth token and addes it to the token object.
 * @param {*} userId The user's id
 * @param {*} ipAddr The users ip address
 */
function createNewAuthToken(userId, ipAddr) {
    let token = crypto.randomBytes(32).toString("hex");
    tokens[token] = { ipAddr: ipAddr, userId: userId, lastUsed: getDateTime() };
    saveTokens();
    return token;
}

/**
 * Updates the time a token was last used to 'right now'
 * @param {*} token The token to upldate 
 */
function updateTokenLastUse(token) {
    tokens[token].lastUsed = getDateTime();
    saveTokens();
}

function deleteToken(token) {
    delete tokens[token];
}

/**
 * saves tokens to file
 */
function saveTokens() {
    writeObj(tokens, FilePaths.AUTH_TOKEN_FILE);
}

/**
 * Inserts a new user into the database
 * @param {*} user 
 * @param {*} credentials 
 * @returns a Promise. Rejects with an error message, or resolves with no arguments
 */
function AddUser(user, credentials) {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error) {
                log(error);
                reject({ error: error, message: "Database Error. Please Try Later." });
            }
            connection.beginTransaction(function (error) {
                if (error) {
                    return connection.rollback(function () {
                        reject({ error: error, message: "Database Error. Please Try Later." });
                    });
                }

                // 1.) insert the user
                let userSql = `INSERT INTO user SET ?`;
                connection.query(userSql, user, (error, results, fields) => {
                    if (error) {
                        let responseMessage = "There was an unknown error. Please try again.";
                        // if ER_DUP_ENTRY
                        if (error.errno === 1062) {
                            if(error.message.includes("user.email")) {
                                responseMessage = "It looks like this email is already in use.";
                            }   
                            else if(error.message.includes("user.username")) {
                                responseMessage = "This username is already taken.";
                            }
                            else {
                                // this should never be hit.
                                log("Inserting new user into database failed for a duplicate entry, however, we were unable to parse the error to find out why.");
                                log(error.message);
                                responseMessage = error.message;
                            }
                        }

                        return connection.rollback(function () {
                            reject({ error: error, message: responseMessage });
                        });
                    }

                    // 2.) get id
                    let getIdSql = 'SELECT LAST_INSERT_ID() as id';
                    connection.query(getIdSql, (error, results, fields) => {
                        if (error) {
                            return connection.rollback(function () {
                                log(error.message);
                                reject({ error: error, message: "Database issue. Please Try Later." });
                            });
                        }

                        let userId = results[0].id;
                        credentials.id = userId;

                        // 2.) insert the credentials
                        let credSql = `INSERT INTO user_credential SET ?`
                        connection.query(credSql, credentials, (error, results, fields) => {
                            console.log(results);
                            if (error) {
                                return connection.rollback(function () {
                                    log(error.message);
                                    reject({ error: error, message: "Database issue. Please Try Later." });
                                });
                            }

                            connection.commit(error => {
                                if (error) {
                                    return connection.rollback(function () {
                                        log(error.message);
                                        reject({ error: error, message: "Database issue. Please Try Later." });
                                    });
                                }
                                else {
                                    resolve();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}

/**
 * Used to log users in.
 * @param {*} nameOrEmail 
 * @param {*} password 
 * @param {*} ipAddr 
 * @returns a new auth token
 */
function getAuthToken(nameOrEmail, password, ipAddr) {
    return new Promise((resolve, reject) => {
        let loginError = null;

        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    reject(err)
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
                    if (error) {
                        return connection.rollback(function () {
                            reject(error);
                        });
                    }

                    let token = null;
                    let userId = null;
                    if (results[0]) {
                        console.log(results);
                        let hash = results[0].hashed;
                        let salt = results[0].salt;
                        userId = results[0].id;
                        if (userId === null) {
                            console.log("UserId is null. This should never happen.");
                        }

                        // this is a good login attempt
                        if (hash === getHash(password, salt) && userId) {
                            token = createNewAuthToken(userId, ipAddr);
                        }
                        // this is a bad login attempt
                        else {
                            log(`Bad login attempt from ${ipAddr}. Invalid Password.`);
                            loginError = "Invalid Username/Password";
                        }
                    }
                    else {
                        log(`Bad login attempt from ${ipAddr}. ${nameOrEmail} not found.`);
                        loginError = "Invalid Username/Password";
                    }

                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                reject(err);
                            });
                        }
                        if (token) {
                            resolve(token);
                        }
                        else {
                            resolve(null);
                        }

                    });
                });
            });
        });
    });
}

/**
 * @returns A hashed password.
 * @param {*} password 
 * @param {*} salt 
 */
function getHash(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}


/**
 * DAO for creating and authenticating users.
 */
module.exports = class AuthDAO {
    constructor() {

    }

    /**
     * Adds a new user to the database
     * @param {*} desiredUsername 
     * @param {*} email 
     * @param {*} pw 
     */
    createNewUser(desiredUsername, email, pw) {
        const salt = createSalt();
        const hash = getHash(pw, salt);

        let newUser = {
            username: desiredUsername,
            email: email,
            active: 1,
            signupDate: getDateTime(),
        };

        let credential = {
            hashed: hash,
            salt: salt
        };

        return AddUser(newUser, credential);
    }

    /**
     * Fetches a new auth token for a user
     * @param {*} nameOrEmail 
     * @param {*} password 
     * @param {*} ipAddr 
     * @param {*} onSuccess callback function
     */
    getAuthToken(nameOrEmail, password, ipAddr, onSuccess) {
        return getAuthToken(nameOrEmail, password, ipAddr, onSuccess);
    }

    /**
     * Parses auth token from headers
     * @param {*} headers 
     * @returns the id of the user, or null if the auth token isn't valid.
     */
    authenticate(headers) {
        const token = headers.authorization;
        let userId = tokens[token];

        if (DEBUG) {
            console.log(`UserId: ${userId}`);
            console.log(`Auth Token: ${token}`);
        }

        if (userId) {
            updateTokenLastUse(token);
            return userId;
        }
        return null;
    }

    signUserOut(headers) {
        const token = headers.authorization;
        deleteToken(token);
    }
}
