const crypto = require("crypto");
const DAO = require("./DAO");
const tokenHandler = require("./TokenHandler");

/**
 * @returns a 32 byte random string of hex digits
 */
function createSalt() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * @returns a 4 byte random string of hex digits
 */
function createVerificationCode() {
    return crypto.randomBytes(4).toString("hex");
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
class AuthDAO extends DAO {
    constructor() {
        super(10, 'localhost', 'gracie', 'pass123$', 'gif_it');
        this.tokenHandler = tokenHandler;
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

        let user = {
            username: desiredUsername,
            email: email,
            active: 1,
            signupDate: this.getTimeStamp(),
        };

        let credentials = {
            hashed: hash,
            salt: salt,
            id: null // this will get set before insertion
        };

        // attempt to insert this new user into db
        let logFailure = this.logFailure; // this is a scoping thing
        return new Promise((resolve, reject) => {
            this.getConnection(connection => {
                if (!connection) {
                    logFailure("Problem getting DB connection when attempting to add user.");
                    reject("Database Issue. Try again later.");
                    return;
                }

                connection.beginTransaction(function (error) {
                    if (error) {
                        logFailure()
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
                                if (error.message.includes("user.email")) {
                                    responseMessage = "It looks like this email is already in use.";
                                }
                                else if (error.message.includes("user.username")) {
                                    responseMessage = "This username is already taken.";
                                }
                                else {
                                    // this should never be hit.
                                    logFailure("Inserting new user into database failed for a duplicate entry, however, we were unable to parse the error to find out why.");
                                    logFailure(error.message);
                                    responseMessage = error.message;
                                }
                            }

                            return connection.rollback(function () {
                                logFailure(error);
                                reject({ error: error, message: responseMessage });
                            });
                        }

                        // 2.) get id
                        let getIdSql = 'SELECT LAST_INSERT_ID() as id';
                        connection.query(getIdSql, (error, results, fields) => {
                            if (error) {
                                return connection.rollback(function () {
                                    logFailure(error.message);
                                    reject({ error: error, message: "Database issue. Please Try Later." });
                                });
                            }

                            let userId = results[0].id;
                            credentials.id = userId;

                            // 2.) insert the credentials
                            let credSql = `INSERT INTO user_credential SET ?`
                            connection.query(credSql, credentials, (error, results, fields) => {
                                if (error) {
                                    return connection.rollback(function () {
                                        logFailure(error);
                                        reject({ error: error, message: "Database issue. Please Try Later." });
                                    });
                                }

                                // 3 insert the verification code
                                let verSql = `INSERT INTO user_verification SET ?`;
                                let verificationCode = createVerificationCode();
                                connection.query(verSql, { id: userId, code: verificationCode }, (error, results, fields) => {
                                    if (error) {
                                        return connection.rollback(function () {
                                            logFailure(error.message);
                                            reject({ error: error, message: "Database issue. Please Try Later." });
                                        });
                                    }

                                    connection.commit(error => {
                                        if (error) {
                                            return connection.rollback(function () {
                                                logFailure(error.message);
                                                reject({ error: error, message: "Database issue. Please Try Later." });
                                            });
                                        }
                                        else {
                                            resolve({ userId: userId, verificationCode: verificationCode });
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    /**
    * Fetches a new auth token for a user
    * @param {*} nameOrEmail 
    * @param {*} password 
    * @param {*} ipAddr 
    * @param {*} onSuccess callback function
    */
    getAuthToken(nameOrEmail, password, ipAddr, onSuccess) {
        this.tokenHandler.getAuthToken(getAuthToken(nameOrEmail, password, ipAddr, onSuccess));
    }

    /**
    * Used to log users in.
    * @param {*} nameOrEmail 
    * @param {*} password 
    * @param {*} ipAddr 
    * @returns a Promise that resolves with a new auth token and rejects with an error message.
    */
    logIn(nameOrEmail, password, ipAddr) {
        return new Promise((resolve, reject) => {
            let loginError = null;
            let logFailure = this.logFailure;

            this.getConnection((connection => {
                if (!connection) {
                    logFailure("Could not get database connection when attempting to log user in.");
                    reject("Database Problem.");
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
                                token = tokenHandler.createNewAuthToken(userId, ipAddr);
                            }
                            // this is a bad login attempt
                            else {
                                logFailure(`Bad login attempt from ${ipAddr}. Invalid Password.`);
                                loginError = "Invalid Username/Password";
                            }
                        }
                        else {
                            logFailure(`Bad login attempt from ${ipAddr}. ${nameOrEmail} not found.`);
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
            }));
        });
    }

    /**
     * Parses auth token from headers
     * @param {*} headers 
     * @returns the id of the user, or null if the auth token isn't valid.
     */
    authenticate(headers) {
        const token = headers.authorization;
        let userId = tokenHandler.getUserId(token);
        
        if (DEBUG) {
            console.log(`UserId: ${userId}`);
            console.log(`Auth Token: ${token}`);
        }
        
        if (userId) {
            return userId;
        }

        return null;
    }

    signUserOut(headers) {
        tokenHandler.deleteToken(headers.authorization);
    }

    verifyUserEmailAddr(userId, code) {
        return new Promise((resolve, reject) => {
            this.getConnection(connection => {
                if (!connection) {
                    this.logFailure(error);
                    reject({ error: error, message: "Database Error. Please Try Later." });
                }

                let sql = `UPDATE user_verification SET ? WHERE code = ${connection.escape(code)} AND id = ${connection.escape(userId)}`;
                connection.query(sql, { verified: 1 }, (error, results, fields) => {
                    console.log(results);
                    if (error) {
                        this.logFailure(error);
                        reject(error);
                    }

                    if (results.changedRows === 1) {
                        resolve("Verification success!");
                    }
                    else {
                        this.logFailure(`Could not verify user ${userId}, with verification code ${code}`);
                        reject("Problem Verifying Email.");
                    }


                });
            });
        });
    }
}

module.exports = AuthDAO;

