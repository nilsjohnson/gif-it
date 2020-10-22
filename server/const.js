const os = require('os');

const BASE_DIR_NAME = '/gif-it-files';

const FilePaths = {
    BASE_DIR: os.homedir + BASE_DIR_NAME,
    // Where uploads from the users go
    UPLOAD_DIR: os.homedir + BASE_DIR_NAME + '/uploads',
    // Where we put the gifs before copying to s3
    GIF_SAVE_DIR: os.homedir + BASE_DIR_NAME + '/gifs',
    AUTH_TOKEN_FILE: os.homedir + BASE_DIR_NAME + '/auth_tokens.json',
    CURRENT_UPLOADS_FILE: os.homedir + BASE_DIR_NAME + '/currentUploads.json'
}

const MAX_UPLOAD_SIZE = 70; // in MB
const MAX_TAG_LENGTH = 32; // characters
const MAX_SEARCH_INPUT_LENGTH = 150; // characters
const PORT_NUM = 3001;

const BUCKET_NAME = (DEV ? 'test.gif-it.io' : 'gif-it.io');




exports.MAX_SEARCH_INPUT_LENGTH = MAX_SEARCH_INPUT_LENGTH;
exports.PORT_NUM = PORT_NUM;
exports.MAX_TAG_LENGTH = MAX_TAG_LENGTH;
exports.BUCKET_NAME = BUCKET_NAME;
exports.FilePaths = FilePaths;
exports.MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE;
