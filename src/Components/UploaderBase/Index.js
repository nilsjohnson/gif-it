import { Component } from "react";
import socketIOClient from "socket.io-client";
import { uploadFile, getServer } from "../../util/data"
import { formatBytes } from '../../util/util';

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
            console.log("uploadComplete");
            console.log(data);
            const { uploadId } = data;

            this.updateUploads(uploadId, {
                status: "settingOptions"
            });
        });

        /*
          As user enters tags, we try to suggest what they might be looking for.
        */
        this.socket.on("SuggestionsFound", (data) => {
            console.log("suggestions found");
            console.log(data);
            const { uploadId, tags } = data;

            this.updateUploads(uploadId, {
                suggestions: tags
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
    upload = () => {
        if (this.curFileNum >= this.uploads.length) {
            return;
          }
        console.log(`Starting upload at index ${this.curFileNum}`);

        let curFile = this.uploads[this.curFileNum].file;
        let tempUploadId = this.uploads[this.curFileNum].uploadId;
        if (curFile.size / (1000 * 1000) > this.maxUploadSize) {
            this.setError(this.curFileNum, `File Must Not Exceed ${formatBytes(this.maxUploadSize * 1000 * 1000)}`);
            this.curFileNum++;
            return this.upload();
        }

        if (!this.isValidType(curFile.type)) {
            this.setError(this.curFileNum, `File must be of type {${this.allowedMimeTypes}}. '${curFile.type}' was provided`);
            this.curFileNum++;
            return this.upload();
        }

        let formData = new FormData();
        formData.append("files", curFile);

        return uploadFile(this.socket.id, tempUploadId, formData, 'make_gif')
            .then(response => {
                if (response.ok) {
                    console.log(`Upload #${this.curFileNum + 1} successfully uploaded.`)
                    this.curFileNum++;
                    this.upload();
                }
                else {
                    console.log("response not ok..");
                    response.json().then(resJson => {
                        console.log(resJson);
                        this.uploads[this.curFileNum].error = resJson.error;

                        this.setState({
                            uploads: this.uploads
                        });

                        this.curFileNum++;
                        this.upload();
                    });
                }
            })
            .catch(err => {
                console.log("Upload error:" + err)
                this.curFileNum++;
                this.upload();
            });
    }

    /**
     * Given that there are three possible entry points for files, we
     * use this method to funnel them all down into one single array.
     */
    initUpload = () => {
        if (!this.checkNumUploads()) {
            console.log("too many ploads");
            this.unprocessedFiles = [];
            return;
        }

        for (let i = 0; i < this.unprocessedFiles.length; i++) {
            this.numFilesChosen++;
            let temp = {
                uploadId: `temp_id_${i + this.numFilesChosen}_${this.unprocessedFiles[i].name}`,
                percentUploaded: 0,
                status: "uploading",
                file: this.unprocessedFiles[i]
            }
            this.uploads.push(temp);
        }

        // reset this array so that user can add more files and update the state.
        this.unprocessedFiles = [];
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
        if(!this.inputElementId) {
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

        this.setState({ uploads: this.uploads }, this.checkNumUploads);
        this.curFileNum--;
    }

    /**
     * Fetches suggested tags based on partial input.
     * @param {*} uploadId 
     * @param {*} input 
     */
    requestTagSuggestions = (uploadId, input) => {
        console.log("fetching suggested tags");

        console.log("input.trim:");
        console.log(input);

        if (input.trim().length <= 2) {
            return;
        }

        this.socket.emit("SuggestTags", {
            uploadId: uploadId,
            input: input
        });
    }

    isValidType(uploadType) {
        console.log(uploadType);

        // we accept everything
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

    checkNumUploads = () => {
        if (this.unprocessedFiles.length + this.state.uploads.length > this.maxNumUploads) {
            this.setState({ tooManyFilesSelected: true });
            return false;
        }
        else {
            this.setState({ tooManyFilesSelected: false });
            return true;
        }
    }

}

export default UploaderBase;


