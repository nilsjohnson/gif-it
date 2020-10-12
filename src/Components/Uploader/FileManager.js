export default class FileManager {
    constructor() {
        this.fileNum = 0;
        this.files = {};
    }

    addFile(file) {
        this.files[this.fileNum] = file;
        this.fileNum++;
        return this.fileNum - 1;
    }

    getFile(fId) {
        return this.files[fId];
    }

    deleteFile(fId) {
        delete this.files[fId];
    }
}