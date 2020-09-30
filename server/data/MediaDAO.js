const DAO = require("./DAO");
const log = require("../util/logger");
const { BUCKET_NAME } = require("../const");

/** function that gets called to execute sql. See MediaDAO constructor. */
let query;

async function getMediaByTags(connection, tags) {
    let sql =
        `SELECT distinct media.fileName, media.descript, media.thumbName, media.id from media
            JOIN media_tag ON media.id = media_tag.media_id
            JOIN tag ON media_tag.tag_id = tag.id
        WHERE `;

    for (let i = 0; i < tags.length; i++) {
        sql += `tag = ?`;
        sql += (i + 1 < tags.length ? " OR " : " ");
    }

    return await query(connection, sql, tags);
}

async function getMediaById(connection, id) {
    let sql =
        `SELECT 
        media.descript, 
        media.fileName, 
        JSON_OBJECTAGG(IFNULL(tag.tag, '$'), 
            (SELECT COUNT(media_tag.tag_id)
                FROM media_tag
                WHERE media_tag.tag_id = tag.id)
            ) as tags 
        FROM media
            LEFT JOIN media_tag ON media.id = media_tag.media_id
            LEFT JOIN tag ON media_tag.tag_id = tag.id
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
        media.thumbName,
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

async function insertAlbumItem(connection, args) {
    let sql = 'INSERT INTO album_items SET ?';
    return await query(connection, sql, args);
}

async function insertAlbum(connection, args) {
    let sql = `INSERT INTO album SET ?`;
    return await query(connection, sql, args);
}

async function insertMediaOwner(connection, args) {
    let sql = 'INSERT INTO media_owner SET ?';
    return await query(connection, sql, args);
}

async function insertMediaTag(connection, args) {
    let sql = `INSERT INTO media_tag SET ?`
    return await query(connection, sql, args);
}

async function insertMedia(connection, args) {
    let sql = `INSERT INTO media SET ?`;
    return await query(connection, sql, args);
}

async function insertUpload(connection, args) {
    let sql = `INSERT INTO upload SET ?`;
    return await query(connection, sql, args);
}

async function insertTag(connection, args) {
    let sql = `INSERT IGNORE INTO tag SET tag = ?`;
    return await query(connection, sql, args);
}

async function getTagId(connection, tag) {
    let sql = "SELECT id FROM tag WHERE tag = ?";
    return await query(connection, sql, tag);
}

async function insertTags(connection, uploadId, tags) {
    if (!tags || tags.length < 1) {
        console.log("no tags.");
        return;
    }

    let args, results;
    // for each tag
    for (let i = 0; i < tags.length; i++) {
        // insert tag
        args = tags[i];
        results = await insertTag(connection, args);

        // insert tag_id/media_id into the media_tag join table
        let tagId;
        if (results.insertId > 0) {
            // if this was a new tag, we know it's id
            tagId = results.insertId;
        }
        else {
            // get tagId by tag
            args = tags[i];
            results = await getTagId(connection, args);
            console.log(results);
            tagId = results[0].id;
        }

        args = { media_id: uploadId, tag_id: tagId }
        results = await insertMediaTag(connection, args);
    }
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
 * DAO for creating and retrieving media.
 */
class MediaDAO extends DAO {
    constructor() {
        super(
            51,             // max connectiond 
            'localhost',    // location
            'bryn',         // username
            'doggie',       // pw
            'gif_it'        // databse
        );

        // allow private methods access to the classes sql execution method
        query = this.query;
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
     * Gets the most recent uploads
     * @param {*} qty 
     * @param {*} callback callback method that returns an array of objects
     */
    getMostRecent(qty, callback) {
        this.getConnection(connection => {
            if (!connection) {
                return callback(null);
            }

            let sql = `SELECT media.id, media.descript, media.fileName, media.thumbName FROM media
            JOIN upload ON media.id = upload.id
            ORDER BY upload.date DESC 
            limit ${qty};`;

            connection.query(sql, (error, results, fields) => {
                connection.release();

                if (DEV) {
                    for (let i = 0; i < results.length; i++) {
                        results[i].fileName = makeDevPath(results[i].fileName);
                        results[i].thumbName = makeDevPath(results[i].thumbName);
                    }
                }

                callback(results);
                if (error) {
                    this.logFailure(error);
                }
            });
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
                console.log(results);
                if (DEV) {
                    results[0].fileName = makeDevPath(results[0].fileName);
                    results[0].thumbName = makeDevPath(results[0].thumbName);
                }

                console.log(results);
                onSuccess(results[0]);

                connection.release();
            }
            catch (ex) {
                log(ex);
                onFail("Database problem. Couldn't create album.");
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
     * Inserts a new media item into the database
     * @param {*} media 
     * @param {*} ownerId 
     * @param {*} userIpAddr 
     * @param {*} onSuccess callback, taking zero arguments
     * @param {*} onFail callback, taking a message to give to user.
     */
    addMedia(media, ownerId, userIpAddr, onSuccess, onFail) {
        const {
            uploadId,
            fileName,
            thumbName,
            tags,
            description,
            originalFileName,
            type
        } = media;

        console.log(media);

        let args, results;

        this.getConnection(async (connection) => {
            if (!connection) {
                onFail("Couldn't get db connection.");
            }

            try {
                await this.startTransaction(connection);

                // insert the media
                args = {
                    id: uploadId,
                    descript: description,
                    fileName: fileName,
                    thumbName: thumbName,
                    fileType: type
                };
                results = await insertMedia(connection, args);

                // insert the upload
                args = {
                    id: uploadId,
                    date: this.getTimeStamp(),
                    ipAddr: userIpAddr,
                    originalFileName: originalFileName
                };
                results = await insertUpload(connection, args);

                // insert tags
                await insertTags(connection, uploadId, tags);

                // insert into the media_owner table
                args = { media_id: uploadId, owner_id: ownerId };
                results = await insertMediaOwner(connection, args);

                await this.completeTransation(connection);
                return onSuccess(uploadId);

            }
            catch (ex) {
                console.log("catching db err");
                log(ex);
                connection.rollback();
                return onFail("Problem inserting media into database. Please try again later.");
            }
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
                if(DEV) {
                    for(let i = 0; i < results.length; i++) {
                        results[i].thumbName = makeDevPath(results[i].thumbName);
                    }
                }

                onSuccess(results);
            }
            catch(ex) {
                log(ex);
                onFail("database issue");
            }
            connection.release()

        });
    }

    /**
     * 
     * @param {*} album 
     * @param {*} uploadIp 
     * @param {*} onSuccess callback taking zero arguments.
     * @param {*} onFail callback taking a string with a generic message to show user if error occured.
     */
    createAlbum(album, ownerId, uploadIp, onSuccess, onFail) {
        const { albumTitle = "", items = [] } = album;
        let args, results;

        this.getConnection(async (connection) => {
            if (!connection) {
                onFail("Problem connecting to database.");
            }

            try {
                await this.startTransaction(connection);

                // 1.) create album
                args = { title: albumTitle, owner_id: ownerId };
                results = await insertAlbum(connection, args);
                let albumId = results.insertId;

                // 2.) insert the media and upload info
                for (let i = 0; i < album.items.length; i++) {
                    // destructure the photo
                    const {
                        uploadId,
                        fileName,
                        thumbName,
                        tags = [],
                        description = '',
                        originalFileName,
                        fileType } = items[i];

                    // insert the media
                    args = { id: uploadId, descript: description, fileName: fileName, thumbName: thumbName, fileType: fileType };
                    results = await insertMedia(connection, args);

                    // insert the tags
                    await insertTags(connection, uploadId, tags);

                    // insert the upload
                    args = { id: uploadId, date: this.getTimeStamp(), ipAddr: uploadIp, originalFileName: originalFileName };
                    results = await insertUpload(connection, args);

                    // insert the album item
                    args = { media_id: uploadId, album_id: albumId, item_index: i };
                    results = await insertAlbumItem(connection, args);

                    // insert into the media_owner table
                    args = { media_id: uploadId, owner_id: ownerId };
                    results = await insertMediaOwner(connection, args);
                }

                await this.completeTransation(connection);
                onSuccess(albumId);

            }
            catch (ex) {
                log(ex);
                connection.rollback();
                onFail("Database problem. Couldn't create album.");
            }
        });
    }

    getAlbumById(albumId, onSuccess, onFail) {
        this.getConnection(async connection => {
            try {
                // get the album. There should only be 1.
                let results = await getAlbumById(connection, albumId);
                console.log(results);

                // if we didnt find album, return null;
                if (!results || results.length < 1) {
                    return onSuccess(null);
                }
                console.log("raw");
                console.log(results);

                let album = {};
                album.title = results[0].title;
                album.description = results[0].descript;
                album.ownerId = results[0].owner_id;
                album.items = [];

                // add items;
                for (let i = 0; i < results.length; i++) {
                    let tags = results[i].tags;
                    album.items.push({
                        fileName: !DEV ? results[i].fileName : makeDevPath(results[i].fileName),
                        thumbName: !DEV ? results[i].thumbName : makeDevPath(results[i].thumbName),
                        tags: tags,
                        fileType: results[i].fileType,
                        description: results[i].descript
                    });
                }

                console.log("Here is the response: ");
                console.log(album);

                connection.release();
                onSuccess(album);
            }
            catch (ex) {
                log(ex);
                onFail("Database Problem.");
            }

        });
    }
}

function makeDevPath(fileName) {
    return `https://s3.amazonaws.com/${BUCKET_NAME}/${fileName}`;
}

module.exports = MediaDAO;