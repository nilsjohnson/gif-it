class Upload {
    constructor(uploadId, socketId, uploadDst, givenFileName, ipAddr, userId) {
        this.uploadId = uploadId;
        this.socketId = socketId;
        this.uploadDst = uploadDst;
        this.givenFileName = givenFileName;
        this.ipAddr = ipAddr;
        this.userId = userId;
        this.uploadTime = new Date().getTime();
    }
}

module.exports = Upload;