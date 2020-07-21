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
    UPLOAD_DIR: os.tmpdir + '/' + 'gif-it',
    GIF_SERVE_DIR: os.homedir + '/gifs'
}

MAX_UPLOAD_SIZE = 75; // in MB



exports.Ports = Ports;
exports.ServeModes = ServeModes;
exports.FilePaths = FilePaths;
exports.MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE;
