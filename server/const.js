const os = require('os');

Ports = {
    HTTP_PORT_NUM: 3001,
    HTTPS_PORT_NUM: 443
}

ServeModes = {
    PRODUCTION: "Production",
    DEV: "Development"
}

FilePaths = {
    UPLOAD_DIR: os.tmpdir + '/' + 'gif-it',
    GIF_SERVE_DIR: os.homedir + '/gifs'
}

MAX_UPLOAD_SIZE = 75; // in MB



exports.Ports = Ports;
exports.ServeModes = ServeModes;
exports.FilePaths = FilePaths;
exports.MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE;
