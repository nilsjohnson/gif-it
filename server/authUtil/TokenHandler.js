const crypto = require("crypto");
const { readObj, writeObj } = require('../util/fileUtil');
const { FilePaths } = require('../const');
const { getTimeStamp } = require("../util/util");

/**
 * This singleton is performs all logic related to auth tokens.
 */
class TokenHandler {
    constructor() {
        this.tokens = readObj(FilePaths.AUTH_TOKEN_FILE);
    }

    /**
 * Makes a new auth token and addes it to the token object.
 * @param {*} userId The user's id
 * @param {*} ipAddr The users ip address
 */
    createNewAuthToken(userId, ipAddr) {
        let token = crypto.randomBytes(32).toString("hex");
        this.tokens[token] = { ipAddr: ipAddr, userId: userId, lastUsed: getTimeStamp() };
        this.saveTokens();
        return token;
    }

    /**
     * Updates the time a token was last used to 'right now'
     * @param {*} token The token to upldate 
     */
    updateTokenLastUse(token) {
        this.tokens[token].lastUsed = getTimeStamp();
        this.saveTokens();
    }

    getUserId(token) {
        if(!token || token === 'null') {
            // this user probably logged out, or didnt get an auth token to begin with
            return null;
        }

        if(this.tokens[token]) {
            let userId = this.tokens[token].userId;
            if(userId) {
                this.updateTokenLastUse(token);
            }
            return userId;
        }
        else {
            return null;
        }
       
    }

    deleteToken(token) {
        delete this.tokens[token];
        this.saveTokens();
    }

    /**
     * saves tokens to file
     */
    saveTokens() {
        writeObj(this.tokens, FilePaths.AUTH_TOKEN_FILE);
    }
}

// TODO check that this is really a singleton..
let tokenHandler = new TokenHandler();
module.exports = tokenHandler;