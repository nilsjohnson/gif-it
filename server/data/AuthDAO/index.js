const crypto = require("crypto");
const DAO = require("../DAO");
const { NewUserError, LoginError } = require("../errors");
const log = require("../../util/logger");
const { readFile } = require("../../util/fileUtil");
const { FilePaths } = require("../../const");
const AuthToken = require("./AuthToken");
const TokenCache = require("./TokenCache");

// loads the salt we use for salting auth tokens.
const AUTH_TOKEN_SALT = readFile(FilePaths.BASE_DIR + '/authSalt.txt');

let query;

async function deleteAuthToken(connection, tokenHash) {
    let sql = `DELETE FROM authToken WHERE tokenHash = ?`;

    return await query(connection, sql, tokenHash);
}

async function getUserByTokenHash(connection, hash) {
    let sql =
        `SELECT 
            authToken.userId, 
            authToken.dateCreated
        FROM authToken
        WHERE authToken.tokenHash = ?`;

    return await query(connection, sql, hash);
}

async function insertAuthoken(connection, args) {
    let sql = `INSERT INTO authToken SET ?`;
    return await query(connection, sql, args);
}

async function logIn(connection, args) {
    let sql =
        `SELECT 
            user.id, 
            user_credential.hashed, 
            user_credential.salt, 
            user_verification.verified 
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
 * @ returns a brand new auth token.
 */
function generateAuthToken() {
    let token = crypto.randomBytes(64).toString("hex");
    let hash = getAuthTokenHash(token);
    let t = new AuthToken(token, hash);
    console.log("generated new token");
    console.log(t);
    return t;
}

function getAuthTokenHash(token) {
    return crypto.pbkdf2Sync(token, AUTH_TOKEN_SALT, 100000, 64, 'sha512').toString('hex');
}

/**
 * DAO for creating and authenticating users.
 */
class AuthDAO extends DAO {
    constructor() {
        super(20, 'localhost', 'gracie', 'pass123$', 'gif_it');
        this.tokenCache = new TokenCache();
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

                // we are going to log this user in right away, so we make a token.
                let authToken = generateAuthToken();
                // cache this auth token
                this.tokenCache.addAuthTokenToCache(userId, authToken.token);
                // add auth token to db
                insertAuthoken(connection, {
                    tokenHash: authToken.tokenHash,
                    userId: userId,
                    dateCreated: this.getTimeStamp()
                });

                // done. Send back the userId, and the verification code.
                await this.completeTransation(connection);
                return onSuccess(userId, verificationCode, authToken.token);
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
                        //token = generateAuthToken();
                    }
                    // this was a good login attempt, but the account isn't verified.
                    else if (hash === getHash(password, salt) && userId && !verified) {
                        // response = LoginError.NOT_VERIFIED;
                        // we dont reject for this issue at the moment.
                        // token = tokenHandler.createNewAuthToken(userId, ipAddr);
                    }
                    // this is a bad login attempt
                    else {
                        return onFail(LoginError.INVALID_USERNAME_PASSWORD)
                    }

                    /**
                     * For now, we dont require users to be verified
                     * so as long as their pw/username is good, we make a token.
                     */
                    token = generateAuthToken();
                    await insertAuthoken(connection, {
                        tokenHash: token.tokenHash,
                        userId: userId,
                        dateCreated: this.getTimeStamp()
                    });

                    this.tokenCache.addAuthTokenToCache(userId, token.token);

                    onSuccess(token.token);
                }
                else {
                    onFail(LoginError.INVALID_USERNAME_PASSWORD)
                }
            }
            catch (ex) {
                log(ex);
                onFail("Databse Issue.");
            }
            finally {
                connection.release();
            }
        });
    }

    /**
     * Parses auth token from request headers
     * @param {*} headers 
     * @returns A Promise. Resolves with the user Id, otherwise
     * rejects. TODO reject with proper error
     */
    authenticate(headers) {
        // get the token from the headers;
        let token = headers.authorization;
        let userId = this.tokenCache.getUserIdByToken(token);

        return new Promise((resolve, reject) => {
            if(userId) {
                console.log(`userId ${userId} had token in cache.`);
                resolve(userId);
                return;
            }
            console.log(`userId ${userId}. Token not found in cache. Doing db call...`);

            this.getConnection(async connection => {
                if(!connection) {
                    reject("couldnt connect to DB");
                }
                try {
                    let tokenHash = getAuthTokenHash(token);
                    let results = await getUserByTokenHash(connection, tokenHash);
                    console.log('results from getting db');
                    console.log(results);
                    if(results.length > 0 && results[0].userId) {
                        this.tokenCache.addAuthTokenToCache(results[0].userId, token);
                        resolve(results[0].userId);
                    }
                    else {
                        reject("user not authenticated.");
                    }
                }
                catch(ex) {
                    reject(ex);
                }
                finally {
                    connection.release();
                }
            })
        });
    }

    signUserOut(headers, onSuccess, onFail) {
        const token = headers.authorization;
        
        this.tokenCache.deleteToken(token);
        
        this.getConnection(async connection => {
            if(!connection) {
                this.logFailure('couldnt get db connection');
            }
            try {
                let tokenHash = getAuthTokenHash(token);
                await deleteAuthToken(connection, tokenHash);
                onSuccess();
            }
            catch(ex) {
                onFail(ex);
            }
            finally {
                connection.release();
            }
        });
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

let authDAO = new AuthDAO;
module.exports = authDAO;
