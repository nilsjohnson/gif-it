
module.exports = class TokenCache {
    constructor(maxSize = 1000) {
        this.tokens = {};
        this._numTokens = 0;
        this.maxSize = maxSize;
    }

    addAuthTokenToCache(userId, token) {
        if (this._numTokens < this.maxSize) {
            this.tokens[token] = userId;
            this._numTokens++;
            console.log("token added: ");
            console.log(this.tokens);
        }
        else {
            console.log("cache full, should evict.");
            // TODO figure out an eviction policy

        }
    }

    getUserIdByToken(token) {
        return this.tokens[token];
    }

    deleteToken(token) {
        if (delete token[token]) {
            this._numTokens--;
        }
        else {
            console.log(`Token ${token} unable to be deleted.`);
        }
    }
}