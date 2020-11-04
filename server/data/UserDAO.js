const DAO = require("./DAO");

let query;

async function deleteTag(connection, args) {
    let sql =
    `DELETE FROM media_tag 
    WHERE media_tag.media_id = ? AND media_tag.tag_id = (
        SELECT tag.id FROM tag WHERE tag.tag = ?
    )`;

    return await query(connection, sql, args);
}

async function updateMediaDescription(connection, args) {
    let sql = `UPDATE media SET descript = ? WHERE id = ?`;
    return await query(connection, sql, args);
}

async function getFileInfoById(connection, mId) {
    let sql = 
    `SELECT 
        media.id as mediaId,
        media.fileName,
        media.thumbName,
        media.fullSizeName,
        user.id as userId
    FROM media
        JOIN media_owner on media.id = media_owner.media_id
        JOIN user on media_owner.owner_id = user.id
    WHERE media.id = ?`;

    return await query(connection, sql, mId);
}

async function deleteMediaById(connection, mId) {
    let sql = `DELETE FROM media WHERE media.id = ?`;

    return await query(connection, sql, mId);
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
            tagId = results[0].id;
        }

        args = { media_id: uploadId, tag_id: tagId }
        results = await insertMediaTag(connection, args);
    }
}

async function getAlbumByInfoById(connection, aId) {
    let sql =
    `SELECT 
        album.id as albumId,
        album.owner_id as userId,
        media.id as mediaId,
        media.fileName,
        media.thumbName,
        media.fullSizeName
    FROM album
        JOIN album_items ON album.id = album_items.album_id
        JOIN media ON media.id = album_items.media_id
    WHERE album.id = ?`;

    return await query(connection, sql, aId);
}

async function deleteAlbumById(connection, aId) {
    let sql = `DELETE FROM album WHERE album.id = ?`;

    return await query(connection, sql, aId);
}


/**
 * DAO for things the user will do to modify db
 */
class UserDAO extends DAO {
    constructor() {
        super(
            50,             // max connections
            'localhost',    // location
            'bryn',         // username
            'doggie',       // pw
            'gif_it'        // databse
        );

        // allow private methods access to the classes sql execution method
        query = this.query;
    }

    deleteAlbumById(userId, aId, onSuccess, onFail) {
        let mediaToDelete = [];
        this.getConnection(async connection => {
            if (!connection) {
                return onFail("Couldn't get a db connection :(");
            }

            try {
                // start transaction
                await this.startTransaction(connection);
                // get the albums owner, and the items
                let results = await getAlbumByInfoById(connection, aId);
                // if the owner isn't the person who requested this, throw error
                if(results[0].userId !== userId) {
                    throw `User ${userId} does not own album ${aId}. Cannot Delete.`;
                }
                // delete each media item
                for(let i = 0; i < results.length; i++) {
                    await deleteMediaById(connection, results[i].mediaId);
                    // add each file associated with media
                    mediaToDelete.push(results[i].fileName);
                    mediaToDelete.push(results[i].thumbName);
                    if(results[i].fullSizeName) {
                        mediaToDelete.push(results[i].fullSizeName);
                    }
                }
                // delete the album
                results = await deleteAlbumById(connection, aId);
                // finish transaction
                await this.completeTransation(connection);
                // done!
                onSuccess(mediaToDelete);
            }
            catch (ex) {
                onFail(ex);
            }
            finally {
                connection.release();
            }
        });
    }

    deleteMediaById(userId, mId, onSuccess, onFail) {
        let results;
        let filesToDelete = [];

        this.getConnection(async connection => {
            if (!connection) {
                return onFail("Couldn't get a db connection :(");
            }

            try {
                await this.startTransaction(connection);

                // get the user who owns this media
                results = await getFileInfoById(connection, mId);
                // if the userIds dont match, throw exception
                if(results[0].userId !== userId) {
                    log(`User ${userId} attempting to delete ${mId}, which they do not own.`);
                    await this.completeTransation(connection);
                    throw `Illegal request. ${userId} cannot delete media with id ${mId}`;
                }

                if(results[0].fileName) {
                    filesToDelete.push(results[0].fileName);
                }
                if(results[0].thumbName) {
                    filesToDelete.push(results[0].thumbName);
                }
                if(results[0].fullSizeName) {
                    filesToDelete.push(results[0].fullSizeName);
                }
                
                results = await deleteMediaById(connection, mId);
             
                onSuccess(filesToDelete);
                await this.completeTransation(connection);

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
            type,
            fullSizeName
        } = media;

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
                    fullSizeName: fullSizeName,
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
                onSuccess(uploadId);

            }
            catch (ex) {
                log(ex);
                connection.rollback();
                onFail("Problem inserting media into database. Please try again later.");
            }
            finally {
                connection.release();
            }
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
                        fileType,
                        fullSizeName } = items[i];

                    // insert the media
                    args = {
                        id: uploadId,
                        descript: description,
                        fileName: fileName,
                        thumbName: thumbName,
                        fullSizeName: fullSizeName,
                        fileType: fileType
                    };
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
            finally {
                connection.release();
            }
        });
    }

    updateMediaDescription(userId, mId, description, onSuccess, onFail) {
        this.getConnection(async connection => {
            if(!connection) {
                onFail("could not get DB connection.");
            }

            try {
                await this.startTransaction(connection);

                // get the user who owns this media
                let results = await getFileInfoById(connection, mId);
                // if the userIds dont match, throw exception
                if(results[0].userId !== userId) {
                    log(`User ${userId} attempting to update ${mId}, which they do not own.`);
                    await this.completeTransation(connection);
                    throw `Illegal request. ${userId} cannot delete media with id ${mId}`;
                }

                results = await updateMediaDescription(connection, [description, mId]);
                await this.completeTransation(connection);

            }
            catch (ex) {
                onFail(ex);
            }
            finally {
                connection.release();
            }
        });
    }

    addTags(userId, mId, tags, onSuccess, onFail) {
        this.getConnection(async connection => {
            if(!connection) {
                onFail("could not get DB connection.");
            }

            try {
                await this.startTransaction(connection);

                // get the user who owns this media
                let results = await getFileInfoById(connection, mId);
                // if the userIds dont match, throw exception
                if(results[0].userId !== userId) {
                    log(`User ${userId} attempting to update ${mId}, which they do not own.`);
                    await this.completeTransation(connection);
                    throw `Illegal request. ${userId} cannot delete media with id ${mId}`;
                }

                await insertTags(connection, mId, tags);

                await this.completeTransation(connection);

            }
            catch (ex) {
                onFail(ex);
            }
            finally {
                connection.release();
            }
        });
    }

    deleteTags(userId, mId, tags, onSuccess, onFail) {
        this.getConnection(async connection => {
            if(!connection) {
                onFail("could not get DB connection.");
            }

            try {
                await this.startTransaction(connection);

                // get the user who owns this media
                let results = await getFileInfoById(connection, mId);
                // if the userIds dont match, throw exception
                if(results[0].userId !== userId) {
                    log(`User ${userId} attempting to update ${mId}, which they do not own.`);
                    await this.completeTransation(connection);
                    throw `Illegal request. ${userId} cannot delete media with id ${mId}`;
                }

                for(let i = 0; i < tags.length; i++) {
                    results = await deleteTag(connection, [mId, tags[i]]);
                }
                

                await this.completeTransation(connection);

            }
            catch (ex) {
                onFail(ex);
            }
            finally {
                connection.release();
            }
        });
    }
}


let userDAO = new UserDAO();
module.exports = userDAO;