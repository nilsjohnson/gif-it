const os = require('os');

const FilePaths = {
    // Where uploads go from the users
    UPLOAD_DIR: os.tmpdir + '/' + 'gif-it',
    // Where we put the gifs before copying to s3
    // or where we serve them from if we are in DEV mode.
    GIF_SAVE_DIR: os.homedir + '/gifs'
}

const MAX_UPLOAD_SIZE = 70; // in MB
const MAX_TAG_LENGTH = 32; // characters
const MAX_SEARCH_INPUT_LENGTH = 150; // characters
const PORT_NUM = 3001;

const BUCKET_NAME = 'gif-it.io';

exports.MAX_SEARCH_INPUT_LENGTH = MAX_SEARCH_INPUT_LENGTH;
exports.PORT_NUM = PORT_NUM;
exports.MAX_TAG_LENGTH = MAX_TAG_LENGTH;
exports.BUCKET_NAME = BUCKET_NAME;
exports.FilePaths = FilePaths;
exports.MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE;
