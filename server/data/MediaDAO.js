const DAO = require("./DAO");
const log = require("../util/logger");

class MediaDAO extends DAO {
    constructor() {
        //maxConnections, host, user, password, database
        super(10, 'localhost', 'bryn', 'doggie', 'gif_it');
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
    getGifById(gifId, callback) {
        this.getConnection(connection => {
            if (!connection) {
                return callback(null);
            }

            let sql = `SELECT 
            media.descript, 
            media.fileName, 
            JSON_OBJECTAGG(tag.tag, 
                (SELECT COUNT(media_tag.tag_id)
                    FROM media_tag
                    WHERE media_tag.tag_id = tag.id)) as tags 
            FROM media
                JOIN media_tag ON media.id = media_tag.media_id
                JOIN tag ON media_tag.tag_id = tag.id
            WHERE media.id = ?`;


            connection.query(sql, gifId, (error, results, fields) => {
                callback(results);
                connection.release();
                if (error) {
                    this.logFailure(error);
                }
            });
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


    async addAlbumItems(media_id, album_id, connection) {
        let sql = "INSERT INTO album_items ?";
        let row = { media_id: media_id, album_id: album_id };
        let result = connection.query(sql, row, (error, results, fields) => {
            if (error) {
                console.log(error);
                return false;
            }
            return true;
        });

        return await result;
    }

    addMedia(media, userId, userIpAddr, onSuccess, onFail) {
        const {
            uploadId, 
            fileName, 
            thumbFileName, 
            tags, 
            description, 
            originalFileName, 
            type 
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
                    thumbName: thumbFileName, 
                    fileType: type 
                };
                results = await this.insertMedia(connection, args);

                // insert the upload
                args = { 
                    id: uploadId, 
                    date: this.getTimeStamp(), 
                    ipAddr: userIpAddr, 
                    originalFileName: originalFileName 
                };
                results = await this.insertUpload(connection, args);

                // insert tags
                this.insertTags(connection, tags);

                // insert into the media_owner table
                args = { media_id: uploadId, user_id: userId };
                results = await this.insertMediaOwner(connection, args);

                await this.completeTransation(connection);
                return onSuccess();

            }
            catch (ex) {
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
    getGifsByTag(tags, callback) {
        this.getConnection(connection => {
            if (!connection) {
                return callback(null);
            }

            let getGif_sql =
                "SELECT distinct media.fileName, media.descript, media.thumbName, media.id from media \
                    JOIN media_tag ON media.id = media_tag.media_id \
                    JOIN tag ON media_tag.tag_id = tag.id \
                WHERE ";

            for (let i = 0; i < tags.length; i++) {
                getGif_sql += `tag = ?`;
                getGif_sql += (i + 1 < tags.length ? " OR " : " ");
            }

            connection.query(getGif_sql, tags, (error, results, fields) => {
                connection.release();
                callback(results);
                if (error) {
                    this.logFailure(error);
                }
            });
        });
    }

    createAlbum(album, uploadIp, onSuccess, onFail) {
        const { albumTitle = "", photos = [], ownerId } = album;
        let sql, args, results;

        this.getConnection(async (connection) => {
            if (!connection) {
                onFail("Couldn't get db connection.");
            }

            try {
                await this.startTransaction(connection);

                // 1.) create album
                sql = `INSERT INTO album SET ?`;
                args = { title: albumTitle, descript: "TODO", owner_id: ownerId };
                results = await this.query(connection, sql, args);
                let albumId = results.insertId;

                // 2.) insert the media and upload info
                for (let i = 0; i < album.photos.length; i++) {
                    // destructure the photo
                    const { uploadId, fileName, thumbFileName, tags, description, originalFileName } = photos[i];

                    // insert the media
                    sql = `INSERT INTO media SET ?`;
                    args = { id: uploadId, descript: description, fileName: fileName, thumbName: thumbFileName, fileType: 'image' };
                    results = await this.query(connection, sql, args);

                    // insert the upload
                    sql = `INSERT INTO upload SET ?`;
                    args = { id: uploadId, date: this.getTimeStamp(), ipAddr: uploadIp, originalFileName: originalFileName };
                    results = await this.query(connection, sql, args);

                    // insert the album item
                    sql = 'INSERT INTO album_items SET ?';
                    args = { media_id: uploadId, album_id: albumId, item_index: i };
                    results = await this.query(connection, sql, args);

                    if (tags) {
                        // for each tag
                        for (let i = 0; i < tags.length; i++) {
                            // insert the tag
                            sql = `INSERT IGNORE INTO tag SET tag = ?`;
                            args = tags[i];
                            results = await this.query(connection, sql, args);

                            // insert tag_id/media_id into the media_tag join table
                            let tagId;
                            if (results.insertId > 0) {
                                // if this was a new tag, we know it's id
                                tagId = results.insertId;
                            }
                            else {
                                // otherwise we query for it
                                sql = "SELECT id FROM tag WHERE tag = ?";
                                args = tags[i];
                                results = await this.query(connection, sql, args);
                                console.log("this tag is new.");
                                console.log(results);
                                tagId = results[0].id;
                            }

                            sql = `INSERT INTO media_tag SET ?`
                            args = { media_id: uploadId, tag_id: tagId }
                            results = await (query(connection, sql, args));
                        }
                    }

                    // insert into the media_owner table
                    sql = 'INSERT INTO media_owner SET ?';
                    args = { media_id: uploadId, user_id: ownerId };
                    results = await this.query(connection, sql, args);
                }

                await this.completeTransation(connection);
                return onSuccess("Good work.")

            }
            catch (ex) {
                console.log("Exception thrown. Rolling back.");
                connection.rollback();
                onFail(ex);
            }
        });
    }

    async insertTags(connection, tags) {
        // for each tag
        for (let i = 0; i < tags.length; i++) {
            // insert tag
            args = tags[i];
            results = await this.insertTag(connection, args);


            // insert tag_id/media_id into the media_tag join table
            let tagId;
            if (results.insertId > 0) {
                // if this was a new tag, we know it's id
                tagId = results.insertId;
            }
            else {
                // get tagId by tag
                args = tags[i];
                results = await this.getTagId(connection, args);
                console.log(results);
                tagId = results[0].id;
            }

            args = { media_id: uploadId, tag_id: tagId }
            results = this.insertMediaTag(connection, args);
        }
    }

    async insertMediaOwner(connection, args) {
        let sql = 'INSERT INTO media_owner SET ?';
        return await this.query(connection, sql, args);
    }

    async insertMediaTag(connection, args) {
        let sql = `INSERT INTO media_tag SET ?`
        return await this.query(connection, sql, args);
    }

    async insertMedia(connection, args) {
        let sql = `INSERT INTO media SET ?`;
        return await this.query(connection, sql, args);
    }

    async insertUpload(connection, args) {
        let sql = `INSERT INTO upload SET ?`;
        return await this.query(connection, sql, args);
    }

    async insertTag(connection, args) {
        let sql = `INSERT IGNORE INTO tag SET tag = ?`;
        return await this.query(connection, sql, args);
    }

    async getTagId(connection, tag) {
        let sql = "SELECT id FROM tag WHERE tag = ?";
        return await this.query(connection, sql, tag);
    }

}



module.exports = MediaDAO;