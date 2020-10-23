const crypto = require("crypto");
const DAO = require("./DAO");
const tokenHandler = require('../authUtil/TokenHandler');
const { NewUserError, LoginError } = require("./dataAccessErrors");
const log = require("../util/logger");

let query;

async function logIn(connection, args) {
    let sql =
        `SELECT user.id, user_credential.hashed, user_credential.salt, user_verification.verified 
    FROM user_credential 
        JOIN user ON user_credential.id = user.id
        JOIN user_verification ON user_verification.id = user.id 
    WHERE user.email = ? OR user.username = ?`;

    return await query(connection, sql, args);
}

async function insertUser(connection, args) {
    let sql = `INSERT INTO user SET ?`;
    return await query(connection, sql, args);
}

async function insertUserCredential(connection, args) {
    let sql = `INSERT INTO user_credential SET ?`;
    return await query(connection, sql, args);
}

async function insertUserVerification(connection, args) {
    let sql = `INSERT INTO user_verification SET ?`;
    return await query(connection, sql, args);
}

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
        query = this.query;
    }

    /**
     * Adds a new user to the database
     * @param {*} desiredUsername 
     * @param {*} email 
     * @param {*} pw 
     * @param {*} onSuccess
     * @param {*} onFail 
     */
    createNewUser(desiredUsername, email, pw, ipAddr, onSuccess, onFail) {
        this.getConnection(async connection => {
            try {
                await this.startTransaction(connection);

                // generate salt, hash and make make user object
                const salt = createSalt();
                const hash = getHash(pw, salt);
                let results;

                let newUser = {
                    username: desiredUsername,
                    email: email,
                    active: 1,
                    signupDate: this.getTimeStamp()
                };

                let credentials = {
                    hashed: hash,
                    salt: salt,
                    id: null
                };

                // insert the user and get their ID
                results = await insertUser(connection, newUser);
                let userId = results.insertId;
                credentials.id = userId;

                // insert their login credentials
                results = await insertUserCredential(connection, credentials);

                // make their verification code and insert it into user_verification
                let verificationCode = createVerificationCode();
                results = await insertUserVerification(connection, {
                    id: userId,
                    code: verificationCode
                });

                // we are going to log this user in right away. So we're gonna make a token.
                let token = tokenHandler.createNewAuthToken(userId, ipAddr);

                // done. Send back the userId, and the verification code.
                await this.completeTransation(connection);
                return onSuccess(userId, verificationCode, token);
            }
            catch (error) {
                log(error);
                connection.rollback();

                // if ER_DUP_ENTRY
                if (error.errno === 1062) {
                    if (error.message.includes("user.email")) {
                        onFail(NewUserError.EMAIL_ADDR_IN_USE);
                    }
                    else if (error.message.includes("user.username")) {
                        onFail(NewUserError.USERNAME_TAKEN);
                    }
                }
                else {
                    onFail("Problem Creating New User.")
                }
            }
            finally {
                connection.release();
            }
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
    logIn(nameOrEmail, password, ipAddr, onSuccess, onFail) {
        this.getConnection(async connection => {
            if (!connection) {
                onFail("Couldn't get db connection.");
            }

            let token = null;
            let userId = null;
            let verified = null;

            try {
                let results = await logIn(connection, [nameOrEmail, nameOrEmail]);

                if (results[0]) {
                    let hash = results[0].hashed;
                    let salt = results[0].salt;
                    userId = results[0].id;
                    verified = results[0].verified;

                    // this is a good login attempt
                    if (hash === getHash(password, salt) && userId && verified) {
                        token = tokenHandler.createNewAuthToken(userId, ipAddr);
                    }
                    // this was a good login attempt, but the account isn't verified.
                    else if (hash === getHash(password, salt) && userId && !verified) {
                        // response = LoginError.NOT_VERIFIED;
                        // we dont reject for this issue at the moment.
                        token = tokenHandler.createNewAuthToken(userId, ipAddr);
                    }
                    // this is a bad login attempt
                    else {
                        onFail(LoginError.INVALID_USERNAME_PASSWORD)
                    }
                    onSuccess(token);
                }
                else {
                    onFail(LoginError.INVALID_USERNAME_PASSWORD)
                    return connection.release();
                }
            }
            catch (ex) {
                log(ex);
                onFail("Databse Issue.");
                connection.release();
            }
            finally {
                connection.release();
            }
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

    verifyUserEmailAddr(userId, code, ipAddr) {
        return new Promise((resolve, reject) => {
            this.getConnection(connection => {
                if (!connection) {
                    this.logFailure(error);
                    reject({ error: error, message: "Database Error. Please Try Later." });
                }

                let sql = `UPDATE user_verification SET ? WHERE code = ${connection.escape(code)} AND id = ${connection.escape(userId)}`;
                connection.query(sql, { verified: 1 }, (error, results, fields) => {
                    
                    connection.release();

                    if (error) {
                        this.logFailure(error);
                        reject(error);
                    }

                    if (results.changedRows === 1) {
                        let token = tokenHandler.createNewAuthToken(userId, ipAddr)
                        resolve(token);
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
