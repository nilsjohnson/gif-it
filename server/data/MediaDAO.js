const DAO = require("./DAO");
const log = require("../util/logger");
const { BUCKET_NAME } = require("../const");

/** function that gets called to execute sql. See MediaDAO constructor. */
let query;

async function getMediaByUserId(connection, userId) {
    let sql = 
        `SELECT 
            media.id, 
            media.descript as description, 
            media.fileName, 
            media.thumbName,
            album_items.item_index, 
            album.title as albumTitle,
            album.id as albumId,
            user.id as userId,
            user.username,
            upload.date,
            (SELECT count(album_items.media_id)
                FROM album_items
                    JOIN media ON album_items.media_id = media.id
                WHERE album_items.album_id = albumId    
            ) as numAlbumItems
        FROM media
            JOIN upload on media.id = upload.id
            LEFT JOIN album_items ON media.id = album_items.media_id
            LEFT JOIN album ON album.id = album_items.album_id
            JOIN media_owner ON media_owner.media_id = media.id
            JOIN user on user.id = media_owner.owner_id
        WHERE user.id = ? AND (album_items.item_index is null OR album_items.item_index = 0)
        ORDER BY upload.date DESC`;

    return await query(connection, sql, userId);
}

async function getMostRecentMedia(connection, limit) {
    let sql =
        `SELECT 
            media.id, 
            media.descript as description, 
            media.fileName, 
            media.thumbName,
            album_items.item_index, 
            album.title as albumTitle,
            album.id as albumId,
            user.id as userId,
            user.username,
            upload.date,
            (SELECT count(album_items.media_id)
                FROM album_items
                    JOIN media ON album_items.media_id = media.id
                WHERE album_items.album_id = albumId    
            ) as numAlbumItems
        FROM media
            JOIN upload on media.id = upload.id
            LEFT JOIN album_items ON media.id = album_items.media_id
            LEFT JOIN album ON album.id = album_items.album_id
            JOIN media_owner ON media_owner.media_id = media.id
            JOIN user on user.id = media_owner.owner_id
        WHERE album_items.item_index is null OR album_items.item_index = 0
        -- ORDER BY upload.date DESC
        ORDER BY RAND() -- YEAHH, let's make this a little more fun for now..
        LIMIT ${limit}`;

    return await query(connection, sql, limit);
}

async function getMediaByTags(connection, tags) {
    let sql =
    `SELECT
    media.id, 
    media.descript as description, 
    media.fileName, 
    media.thumbName,
    album_items.item_index, 
    album.title as albumTitle,
    album.id as albumId,
    user.id as userId,
    user.username,
    upload.date,
    (SELECT count(album_items.media_id)
        FROM album_items
            JOIN media ON album_items.media_id = media.id
        WHERE album_items.album_id = albumId    
    ) as numAlbumItems
FROM media
    JOIN upload on media.id = upload.id
    LEFT JOIN album_items ON media.id = album_items.media_id
    LEFT JOIN album ON album.id = album_items.album_id
    JOIN media_owner ON media_owner.media_id = media.id
    JOIN user on user.id = media_owner.owner_id
    JOIN media_tag on media_tag.media_id = media.id
    JOIN tag on media_tag.tag_id = tag.id
WHERE `

    for (let i = 0; i < tags.length; i++) {
        sql += `tag = ?`;
        sql += (i + 1 < tags.length ? " OR " : " ");
    }

    return await query(connection, sql, tags);
}

async function getMediaById(connection, id) {
    let sql =
        `SELECT
        media.id, 
        media.descript as description, 
        media.fileName, 
        media.fullSizeName,
        user.id as ownerId,
        JSON_OBJECTAGG(IFNULL(tag.tag, '$'), 
            (SELECT COUNT(media_tag.tag_id)
                FROM media_tag
                WHERE media_tag.tag_id = tag.id)
            ) as tags 
        FROM media
            LEFT JOIN media_tag ON media.id = media_tag.media_id
            LEFT JOIN tag ON media_tag.tag_id = tag.id
            JOIN media_owner ON media.id = media_owner.media_id
            JOIN user ON user.id = media_owner.owner_id
        WHERE media.id = ?`;
        
    let results = await query(connection, sql, id);
    if (results[0].tags) {
        let tags = JSON.parse(results[0].tags);
        delete tags['$'];
        results[0].tags = tags;
    }

    return results;
}

async function getAlbumById(connection, args) {
    let sql =
        `SELECT
        album.title, 
        album.owner_id, 
        media.id, 
        media.descript,
        media.fileName, 
        media.fileType, 
        media.fullSizeName,
        album_items.item_index,
        JSON_OBJECTAGG(IFNULL(tag.tag, '$'), 
            (SELECT COUNT(media_tag.tag_id)
                FROM media_tag
                WHERE media_tag.tag_id = tag.id)
            ) as tags 
        FROM album
            JOIN album_items ON album_items.album_id = album.id
            JOIN media ON media.id = album_items.media_id
            LEFT JOIN media_tag ON media_tag.media_id = media.id
            LEFT JOIN tag on tag.id = media_tag.tag_id
        WHERE album.id = ?
        GROUP BY media.id
        ORDER BY album_items.item_index`;

    let results = await query(connection, sql, args);
    results = parseTags(results);

    return results;
}

function parseTags(results) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].tags) {
            let tags = JSON.parse(results[i].tags);
            delete tags['$'];
            results[i].tags = tags;
        }
    }

    return results;
}

/**
 * DAO for retrieving media.
 */
class MediaDAO extends DAO {
    constructor() {
        super(
            50,             // max connectiond 
            'localhost',    // location
            'bryn',         // username
            'doggie',       // pw
            'gif_it'        // databse
        );

        // allow private methods access to the classes sql execution method
        query = this.query;
    }

    getMediaByUserId(userId, onSuccess, onFail) {
        this.getConnection(async connection => {
            if (!connection) {
                return onFail("Couldn't get a db connection :(");
            }

            try {
                let results = await getMediaByUserId(connection, userId)
                if (DEV) {
                    for (let i = 0; i < results.length; i++) {
                        results[i].fileName = makeDevPath(results[i].fileName);
                        results[i].thumbName = makeDevPath(results[i].thumbName);
                    }
                }

                onSuccess(results);
            }
            catch (ex) {
                onFail(ex);
            }
            finally {
                connection.release();
            }
        });
    }

    /**
     * Fetches the popular tags
     * @param {*} qty 
     * @param {*} callback callback method that takes an array of strings
     */
    getMostPopularTags(qty, callback) {
        this.getConnection(connection => {
            if (!connection) {
                callback(null);
                return;
            }

            let sql = `SELECT tag.tag, COUNT(media_tag.tag_id) as numUses
                FROM tag
                    JOIN media_tag ON tag.id = media_tag.tag_id
                GROUP BY tag.tag
                ORDER BY numUses desc
                limit ${qty};`;

            connection.query(sql, (error, results, fields) => {
                connection.release();
                callback(results);
                if (error) {
                    this.logFailure(error);
                }
            });
        });
    }

    /**
     * 
     * @param {*} qty The limit for number of results
     * @param {*} onSuccess success callback
     * @param {*} onFail failure callback
     */
    getMostRecent(qty, onSuccess, onFail) {
        this.getConnection(async connection => {
            if (!connection) {
                return onFail("Couldn't get a db connection :(");
            }

            try {
                let results = await getMostRecentMedia(connection, qty)
                console.log(results);
                if (DEV) {
                    for (let i = 0; i < results.length; i++) {
                        results[i].fileName = makeDevPath(results[i].fileName);
                        results[i].thumbName = makeDevPath(results[i].thumbName);
                    }
                }
                onSuccess(results);
            }
            catch (ex) {
                onFail(ex);
            }
            finally {
                connection.release();
            }
        });
    }

    /**
     * Gets a gif by its id
     * @param {*} gifId 
     * @param {*} callback callback function that takes an object
     */
    getMediaById(mId, onSuccess, onFail) {
        this.getConnection(async connection => {
            if (!connection) {
                return callback(null);
            }

            try {
                let results = await getMediaById(connection, mId);
                if (DEV) {
                    results[0].fileName = makeDevPath(results[0].fileName);
                    results[0].fullSizeName = makeDevPath(results[0].fullSizeName);
                }

                if(results[0].id) {
                    onSuccess(results[0]);
                }
                else {
                    onSuccess(null)
                }
            }
            catch (ex) {
                log(ex);
            }
            finally {
                connection.release();
            }
        });
    }

    /**
     * Query to get suggested tags a user enters input
     * @param {*} input     what the user has typed
     * @param {*} callback  callback function that takes an array of strings
     * @param {*} limit     the max number of suggestions to return
     */
    getSuggestedTags(input, callback, limit = 3) {
        this.getConnection(connection => {
            if (!connection) {
                return callback(null);
            }

            let sql = `SELECT tag.tag, COUNT(media_tag.tag_id) as numUses
            FROM tag
                JOIN media_tag ON tag.id = media_tag.tag_id
            WHERE tag.tag LIKE '${input}%' 
            GROUP BY tag.tag
            ORDER BY numUses desc
            limit ${limit}`;

            connection.query(sql, (error, results, fields) => {
                callback(results);
                connection.release();

                if (error) {
                    this.logFailure(error);
                }
            });
        });
    }

    /**
     * Finds all gifs with the given tags
     * @param {*} tags 
     * @param {*} callback a function that takes an array of gif objects
     */
    getGifsByTag(tags, onSuccess, onFail) {
        this.getConnection(async connection => {
            if (!connection) {
                return callback(null);
            }

            try {
                let results = await getMediaByTags(connection, tags);

                if (DEV) {
                    for (let i = 0; i < results.length; i++) {
                        results[i].thumbName = makeDevPath(results[i].thumbName);
                    }
                }

                onSuccess(results);
            }
            catch (ex) {
                log(ex);
                onFail("database issue");
            }
            finally {
                connection.release();
            }

        });
    }

    getAlbumById(albumId, onSuccess, onFail) {
        this.getConnection(async connection => {
            try {
                // get the album. There should only be 1.
                let results = await getAlbumById(connection, albumId);

                // if we didnt find album, return null;
                if (!results || results.length < 1) {
                    return onSuccess(null);
                }

                let album = {};
                album.title = results[0].title;
                album.ownerId = results[0].owner_id;
                album.items = [];

                // add items;
                for (let i = 0; i < results.length; i++) {
                    let tags = results[i].tags;
                    album.items.push({
                        fileName: !DEV ? results[i].fileName : makeDevPath(results[i].fileName),
                        thumbName: !DEV ? results[i].thumbName : makeDevPath(results[i].thumbName),
                        fullSizeName: !DEV ? results[i].fullSizeName : makeDevPath(results[i].fullSizeName),
                        tags: tags,
                        fileType: results[i].fileType,
                        description: results[i].descript,
                        id: results[i].id,
                        ownerId: results[i].owner_id
                    });
                }

                onSuccess(album);
            }
            catch (ex) {
                log(ex);
                onFail("Database Problem.");
            }
            finally {
                connection.release();
            }

        });
    }
}

function makeDevPath(fileName) {
    if (fileName) {
        return `https://s3.amazonaws.com/${BUCKET_NAME}/${fileName}`;
    }
    return fileName;
}

let mediaDAO = new MediaDAO();
module.exports = mediaDAO;