class Job {
    constructor(src, uploadId, quality, onStdout, onProgress, onGifMade, onThumbMade) {
        this.src = src;
        this.uploadId = uploadId; 
        this.quality = quality;
        this.onStdout = onStdout; 
        this.onProgress = onProgress;
        this.onGifMade = onGifMade;
        this.onThumbMade = onThumbMade;
    }
}


module.exports = Job;
