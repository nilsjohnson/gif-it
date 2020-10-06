import { Component } from "react";
import socketIOClient from "socket.io-client";
import { uploadFile, getServer } from "../../util/data"
import { formatBytes } from '../../util/util';
import { getPresignedPost, doSignedS3Post, postPhotoGallery } from '../../util/data';

const PROGRESS_BAR_UPDATE_INTERVAL = 250; // milliseconds

/**
 * This Componenent allows users to upload files and convert them to gifs
 */
class UploaderBase extends Component {
    constructor(props) {
        super(props);

        this.state = ({
            uploads: [],
            filesHovering: false,
            tooManyFilesSelected: false

        });

        // Holding bin for files after the user has dragged/dropped or selected them.
        // Given that there are 3 ways for users to select files, we funnel all files
        // to this array to process them with less repeated code.
        this.unprocessedFiles = [];
        // To mark the file we are uploading.
        this.curFileNum = 0
        // To give each file a unique temp_id
        this.numFilesChosen = 0;
        // To hold the uploads. We prevent concurrency issues by having this as the single
        // source of truth. Makes it easier to treat this.state.uploads as an immutable object.
        this.uploads = [];
        // The socket for this upload session
        this.socket = null;
        // the value for estimating progress of s3 uploads
        this.estimatedUploadRate = null;

        /*
            You can override these values using the available pulic methods
        */
        this.makeHandlersCallback = null;
        this.allowedMimeTypes = []; // allows any file
        this.maxUploadSize = 70; // MB
        this.maxNumUploads = 1;
        this.inputElementId = null;
    }

    /**
     * @param {*} types Types of files allowed to be uploaded.
     */
    setAllowedMimeTypes = (types) => {
        this.allowedMimeTypes = types;
    }

    /**
     * @param {*} size Size in megabytes of the maximum allowed upload.
     */
    setMaxUploadSize = (size) => {
        this.maxUploadSize = size;
    }

    /**
     * @param {*} callback To define additional socket listners.
     */
    setMakeHandlersCallback = (callback) => {
        this.makeHandlersCallback = callback;
    }

    setMaxNumUploads = (val) => {
        this.maxNumUploads = val;
    }

    /**
     * @param {*} id  The DOM id of the input element.
     * If you do not call this method, this class will query the DOM for an iput selector.
     * This will cause unpredictable behavior if you have multiple inputs.
     */
    setInputElementId = (id) => {
        this.inputElementId = id;
    }

    componentDidUpdate = () => {
        if (this.uploads.length === 0 && this.socket) {
            this.socket.close();
            this.socket = null;
            console.log("Socket closed.");
        }
    }

    /**
     * updates the the upload object and sets the state.
     * @param {*} uploadId     The upload to update
     * @param {*} obj          The values to update. If field doesnt exist, it will be added.
     */
    updateUploads = (uploadId, obj) => {
        let keys = Object.keys(obj);

        for (let i = 0; i < this.uploads.length; i++) {
            if (this.uploads[i].uploadId === uploadId) {
                for (let j = 0; j < keys.length; j++) {
                    this.uploads[i][keys[j]] = obj[keys[j]];
                }
            }
        }

        this.setState({ uploads: this.uploads })
    }


    /**
     *  To flag or unflag if a user is dragging files over the drop-zone
     * @param {*} val true or false
     */
    setFilesHovering = (val) => {
        this.setState({
            filesHovering: val
        });
    }

    /**
     * Opens the socket and defines the communication actions.
     */
    createSocket = () => {
        console.log("creating socket");
        this.socket = socketIOClient(getServer()); // getServer is to handle dev vs production environments

        /*
          Upon connect, we start uploading.
        */
        this.socket.on("connect", () => {
            console.log(`Socket ${this.socket.id} connected`);
            this.upload();
        });

        /*
          Updates the placeholder uploader with its 'real' id
          and sets its status to uploading.
        */
        this.socket.on("UploadStart", data => {
            console.log('Upload Started, upload object returned: ');
            console.log(data);

            const { uploadId, tempUploadId } = data;

            this.updateUploads(tempUploadId, {
                status: "uploading",
                uploadId: uploadId
            });
        });

        /*
          To handle upload progress updates
        */
        this.socket.on("UploadProgress", data => {
            const { uploadId, percentUploaded } = data;

            this.updateUploads(uploadId, {
                percentUploaded: percentUploaded
            });
        });

        /*
          Sets the uploads status to the next step, 'settingOptions'.
        */
        this.socket.on("uploadComplete", (data) => {
            const { uploadId } = data;

            this.updateUploads(uploadId, {
                status: "settingOptions"
            });
        });

        /*
          As user enters tags, we try to suggest what they might be looking for.
        */
        this.socket.on("SuggestionsFound", (data) => {
            const { uploadId, tags } = data;

            this.updateUploads(uploadId, {
                tagSuggestions: tags
            });
        });

        /*
          If a socket is disconnected it will reconnect but reassign its ID. This means that the
          server can possibly lose track of information. So if the server receives a request that it
          doesnt have information about, it tells the client to start over again.
        */
        this.socket.on("retry", (data) => {
            console.log("Server requesting retry;");
            console.log(data);
            const { uploadId } = data;

            // moves the file back to the unprocessed array then retrys
            for (let i = 0; i < this.uploads.length; i++) {
                if (this.uploads[i].uploadId === uploadId) {
                    this.unprocessedFiles.push(this.uploads[i].file);
                    this.uploads.splice(i, 1);
                    this.curFileNum--;
                    break;
                }
            }

            this.setState({ uploads: this.uploads });
            this.initUpload();
        });

        // make the rest of the handlers;
        if (this.makeHandlersCallback) {
            this.makeHandlersCallback();
        }
        else {
            console.log("No makeHandlersCallback. Please call setMakeHandlersCallback to define additional actions");
        }

    } // end def socket event handlers.

    /**
     * Takes files from unprocessedFiles and recursively uploads them.
     */
    upload = (callback = null) => {
        if (this.curFileNum >= this.uploads.length) {
            if(callback) {
                callback();
            }
            return;
        }

        let curFile = this.uploads[this.curFileNum].file;
        let status = this.uploads[this.curFileNum].status;
        let curThumbFile = this.uploads[this.curFileNum].thumbFile;
        let uploadId = this.uploads[this.curFileNum].uploadId;
        let msg;

        if (curFile.size / (1000 * 1000) > this.maxUploadSize) {
            msg = `File Must Not Exceed ${formatBytes(this.maxUploadSize * 1000 * 1000)}`;
            this.setError(this.curFileNum, msg);
            this.curFileNum++;
            return this.upload(callback);
        }

        if (!this.isValidType(curFile.type)) {
            msg = `File must be of type {${this.allowedMimeTypes}}. '${curFile.type}' was provided`;
            this.setError(this.curFileNum, msg);
            this.curFileNum++;
            return this.upload(callback);
        }

        let regex = /.*\//g;
        let mediaType = curFile.type.match(regex)[0];

        switch (mediaType) {
            case 'image/':
                if(status === null && curFile.type === 'image/gif') {
                    console.log("itss a gif!");
                    this.updateUploads(uploadId, {status: "uploading"} );
                    this.doGifUpload(curFile, uploadId, callback);
                }
                else if(status === null) {
                    // we are going to edit this first, then upload
                    this.curFileNum++;
                    return this.upload(callback);
                }
                // only upload if status is not null
                else {
                    this.doImageUpload(curFile, curThumbFile, uploadId, callback);
                }
                
                break;
            case 'video/':
                // only upload if status is null.
                if(status === null) {
                    this.updateUploads(uploadId, {status: "uploading"} );
                    this.doGifUpload(curFile, uploadId, callback);
                }
                else {
                    this.curFileNum++;
                    return this.upload(callback);
                }
                break;
            default:
                console.log(`Unsure what to do with ${curFile.type} ${mediaType}`);
        }
    }

    /**
     * Given that there are three possible entry points for files, we
     * use this method to funnel them all down into one single array.
     */
    initUpload = () => {
        if (this.maxFilesChosen()) {
            console.log(`The maximum number of files (${this.maxNumUploads}) have already been chosen.`);
            this.unprocessedFiles = [];
            return;
        }

        for (let i = 0; i < this.unprocessedFiles.length; i++) {
            this.numFilesChosen++;
            let temp = {
                uploadId: `temp_id_${i + this.numFilesChosen}_${this.unprocessedFiles[i].name}`,
                percentUploaded: 0,
                status: null,
                file: this.unprocessedFiles[i]
            }
            this.uploads.push(temp);
        }

        // reset this array so that user can add more files and update the state.
        this.unprocessedFiles = [];
        for(let i = 0; i < this.uploads.length; i++) {
            if(this.uploads[i].error) {
                this.removeUpload(this.uploads[i].uploadId);
            }
        }

        this.setState({ uploads: this.uploads });

        // open the socket if necessary
        if (this.socket === null) {
            // this will trigger an upload.
            this.createSocket();
        }
        // otherwise we're set to upload!
        else {
            this.upload();
        }
    }

    /**
     * Sets an upload error by its index. Used for catching gross errors
     * before even attempting upload. - i.e user selects a file that is too big,
     * incorrect extension, etc.
     */
    setError = (index, error) => {
        this.uploads[index].error = error;
        this.setState({
            uploads: this.uploads
        });
    }

    /**
     * Adds all the files unproccessedFiles via select.
     */
    selectFilesUpload = () => {
        let videos;
        if (!this.inputElementId) {
            console.log("querySelector called to get input element.")
            videos = document.querySelector('input[type="file"][multiple]');
        }
        else {
            console.log("getElementById called to get input element.");
            videos = document.getElementById(this.inputElementId);
        }


        for (let i = 0; i < videos.files.length; i++) {
            console.log("pushing file: " + videos.files[i].name);
            this.unprocessedFiles.push(videos.files[i]);
        }

        this.initUpload();
    }

    /**
     * Add files to unproccessedFiles via drag/drop. 
     */
    dropHandler = (ev) => {
        ev.preventDefault();
        this.setFilesHovering(false);

        if (ev.dataTransfer.items) {
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                if (ev.dataTransfer.items[i].kind === 'file') {
                    let file = ev.dataTransfer.items[i].getAsFile();
                    this.unprocessedFiles.push(file);
                }
            }
        }
        else {
            for (var j = 0; j < ev.dataTransfer.files.length; j++) {
                this.unprocessedFiles.push(ev.dataTransfer.files[j]);
            }
        }

        this.initUpload();
    }

    /**
     * 'Activates' drop-zone
     * @param {*} ev 
     */
    dragOverHandler = (ev) => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
        this.setFilesHovering(true);
    }

    /**
     * 'Deactivates' drop-zone if user hovers but doesn't drop files.
     */
    dragEndHandler = (ev) => {
        this.setFilesHovering(false);
    }

    /**
     * Removes an upload by its id.
     * @param {*} uploadId 
     */
    removeUpload = (uploadId) => {
        console.log(`removing upload ${uploadId}`);
        let i = 0;
        while (i < this.uploads.length) {
            if (this.uploads[i].uploadId === uploadId) {
                this.uploads.splice(i, 1);
                break;
            }
            i++;
        }

        this.setState({ uploads: this.uploads }, this.maxFilesChosen);
        this.curFileNum--;
    }

    /**
     * Fetches suggested tags based on partial input.
     * @param {*} uploadId 
     * @param {*} input 
     */
    requestTagSuggestions = (uploadId, input) => {
        if (input.trim().length <= 2) {
            return;
        }

        this.socket.emit("SuggestTags", {
            uploadId: uploadId,
            input: input
        });
    }

    isValidType(uploadType) {
        // we accept everything if no mime types specified
        if (this.allowedMimeTypes.length === 0) {
            return true;
        }

        for (let i = 0; i < this.allowedMimeTypes.length; i++) {
            if (this.allowedMimeTypes[i].includes('/*')) {
                let curType = this.allowedMimeTypes[i].replace('/*', '/');
                if (uploadType.startsWith(curType)) {
                    return true;
                }
            }
            else if (this.allowedMimeTypes[i] === uploadType) {
                return true;
            }
        }

        return false;
    }

    maxFilesChosen = () => {
        if (this.unprocessedFiles.length + this.state.uploads.length > this.maxNumUploads) {
            this.setState({ tooManyFilesSelected: true });
            return true;
        }
        else {
            this.setState({ tooManyFilesSelected: false });
            return false;
        }
    }

    /**
     * A recursive method to update the progress bar of an upload.
     * @param {*} totalUploaded the amount of data that has been uploaded
     * @param {*} upload the upload being uploaded
     * @param {*} fileSize the size of the file being uploaded
     */
    doProgressBar = (upload, fileSize, rate, totalUploaded = 0) => {
        setTimeout(() => {
            if (totalUploaded >= fileSize) {
                return;
            }

            totalUploaded += rate;
            let percent = Math.round(totalUploaded / fileSize * 100);
            percent = percent < 100 ? percent : 100;

            if (upload.status === 'uploading') {
                this.updateUploads(upload.uploadId, { percentUploaded: percent });
                this.doProgressBar(upload, fileSize, rate, totalUploaded);
            }
            else {
                this.updateUploads(upload.uploadId, { percentUploaded: 100 });
                return;
            }
        }, PROGRESS_BAR_UPDATE_INTERVAL);
    }

    setUploadRate = (startTime, endTime, fileSize) => {
        this.estimatedUploadRate = fileSize * PROGRESS_BAR_UPDATE_INTERVAL / (endTime - startTime);
    }

    doGifUpload = (file, tempUploadId, callback) => {
        let formData = new FormData();
        formData.append("files", file);

        return uploadFile(this.socket.id, tempUploadId, formData, 'make_gif')
            .then(response => {
                if (response.ok) {
                    console.log(`Upload #${this.curFileNum + 1} successfully uploaded.`)
                    this.curFileNum++;
                    this.upload(callback);
                }
                else {
                    response.json().then(resJson => {
                        this.uploads[this.curFileNum].error = resJson.error;
                        this.setState({
                            uploads: this.uploads
                        });

                        this.curFileNum++;
                        this.upload(callback);
                    });
                }
            })
            .catch(err => {
                console.log("Upload error:" + err)
                this.curFileNum++;
                this.upload(callback);
            });

    }

    doImageUpload = (curFile, curThumbFile, tempUploadId, callback) => {
       

        let fileSize = curFile.size;
        let fileParts = curFile.name.split('.');

        let fileInfo = {
            fileName: fileParts[0],
            fileType: fileParts[1],
            action: "photo"
        };


        return getPresignedPost(fileInfo).then(res => {
            if (res.ok) {
                return res.json().then(data => {
                    const { photoData = {}, thumbData = {}, uploadId } = data;
                    const photoFormData = this.createForm(photoData.fields, curFile);

                    // update the upload with its server generated key, id, filename, etc
                    this.updateUploads(tempUploadId, {
                        uploadId: uploadId,
                        fileName: photoData.fields.key,
                        thumbName: thumbData.fields.key,
                        status: 'uploading'
                    });

                    // upload the thumbnail, and use this time as a
                    // metric to guess the progress of the fullsize photo.
                    const thumbFormData = this.createForm(thumbData.fields, curThumbFile);
                    let startTime = new Date().getTime();
                    return doSignedS3Post(thumbData.url, thumbFormData).then(res => {
                        if (res.ok) {
                            let endTime = new Date().getTime();
                            this.setUploadRate(endTime, startTime, fileSize);
                        }
                        else {
                            console.log("Thumbnail not uploaded. Attempting to upload fullsize photo.");
                        }

                        // starts the progress bar rolling...
                        this.doProgressBar(this.uploads[this.curFileNum], fileSize, this.state.estimatedUploadRate);
                        // upload photo to s3
                        return doSignedS3Post(photoData.url, photoFormData).then(res => {
                            if (res.ok) {
                                this.updateUploads(uploadId, { status: 'complete' });
                                console.log("file uploaded to s3!");
                            }
                            else {
                                console.log("File could not be uploaded to s3.");
                                this.updateUploads(uploadId, { err: "File couldnt be uploaded." });
                                res.text().then(text => {
                                    console.log(text);
                                });
                            }
                            this.curFileNum++;
                            return this.upload(callback);

                        }).catch(err => {
                            console.log("Problem doing signed s3 post: " + err);
                            this.curFileNum++;
                            return this.upload(callback);
                        });
                    });
                }).catch(err => {
                    console.log("Problem with the JSON returned from fetching presigned posts: " + err);
                    this.curFileNum++;
                    return this.upload(callback);
                });
            }
            else {
                console.log("Problem generating presigned post. Here's the response...");
                console.log(res);
                this.curFileNum++;
                return this.upload(callback);
            }
        }).catch(err => {
            console.log("Problem fetching presigned post: " + err);
            this.curFileNum++;
            return this.upload(callback);
        });
    }

    shiftUpload = (uploadId, direction) => {
        if (!this.uploads || this.uploads.length < 2) {
            return;
        }

        for (let i = 0; i < this.uploads.length; i++) {
            if (this.uploads[i].uploadId === uploadId) {
                let tmp = this.uploads[i];

                // if we want the image to go to a lower index
                if (direction > 0) {
                    if (i === this.uploads.length - 1) {
                        // should wrap. swap first and last elements
                        this.uploads[i] = this.uploads[0];
                        this.uploads[0] = tmp;
                        break;
                    }
                    this.uploads[i] = this.uploads[i + 1];
                    this.uploads[i + 1] = tmp;
                }
                // we want the image to go to a higher index
                else {
                    if (i === 0) {
                        this.uploads[i] = this.uploads[this.uploads.length - 1];
                        this.uploads[this.uploads.length - 1] = tmp;
                        break;
                    }
                    this.uploads[i] = this.uploads[i - 1];
                    this.uploads[i - 1] = tmp;
                }

                break;
            }
        }

        this.setState({ uploads: this.uploads });
    }
}

export default UploaderBase;


