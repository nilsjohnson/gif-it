const os = require('os');

const Ports = {
    HTTP_PORT_NUM: 3001,
    HTTPS_PORT_NUM: 443
}

const ServeModes = {
    PRODUCTION: "Production",
    DEV: "Development"
}

const FilePaths = {
    // Where uploads go from the users
    UPLOAD_DIR: os.tmpdir + '/' + 'gif-it',
    // Where we put the gifs before copying to s3
    // or where we serve them from if we are in DEV mode.
    GIF_SAVE_DIR: os.homedir + '/gifs'
}

const MAX_UPLOAD_SIZE = 70; // in MB
const MAX_TAG_LENGTH = 32;

const PROD_SERVER = `https://api.gif-it.io`;
const DEV_SERVER = `http://localhost:3000`;

const BUCKET_NAME = 'gif-it.io';


exports.MAX_TAG_LENGTH = MAX_TAG_LENGTH;
exports.BUCKET_NAME = BUCKET_NAME;
exports.PROD_SERVER = PROD_SERVER;
exports.DEV_SERVER = DEV_SERVER;
exports.Ports = Ports;
exports.ServeModes = ServeModes;
exports.FilePaths = FilePaths;
exports.MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE;
