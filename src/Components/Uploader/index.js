import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import Upload from "./Upload";
import { uploadFile, getServer } from "../../util/data"
import { DropBox } from "../DropBox";
import { Grid, Box } from "@material-ui/core";
import { formatBytes } from '../../util/util';

const MAX_UPLOAD_SIZE = 70; // MB

/**
 * This Componenent allows users to upload files and convert them to gifs
 */
class Uploader extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      uploads: [],
      filesHovering: false
      
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
    this.socket = socketIOClient(getServer());

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
      To handle conversion progress updates
     */
    this.socket.on("ConversionProgress", (data) => {
      // console.log("Conversion Data:");
      // console.log(data);

      const { uploadId } = data;

      this.updateUploads(uploadId, {
        conversionData: data
      });
    });

    /*
      Marks the conversion as complete so we can serve the .gif
     */
    this.socket.on("ConversionComplete", (data) => {
      console.log("ConversionComplete");
      console.log(data);
      let { servePath, uploadId } = data;

      if (servePath) {
        this.updateUploads(uploadId, {
          servePath: servePath,
          status: "complete"
        });
      }
      else {
        this.updateUploads(uploadId, {
          error: "File could not be converted. The video is most likely not a supported format."
        });
      }
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
      If the user shares, we update the status to 'shared'
    */
    this.socket.on("ShareResult", (data) => {
      console.log("ShareResult hit");
      console.log(data);
      const { status, uploadId, error } = data;

      if (error) {
        this.updateUploads(uploadId, {
          error: error
        });

        return;
      }

      this.updateUploads(uploadId, {
        status: status
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
    if (curFile.size / (1000 * 1000) > MAX_UPLOAD_SIZE) {
      this.setError(this.curFileNum, `File Must Not Exceed ${formatBytes(MAX_UPLOAD_SIZE * 1000 * 1000)}`);
      this.curFileNum++;
      return this.upload();
    }
    if (!curFile.type.startsWith('video/')) {
      this.setError(this.curFileNum, `File must be of type video. '${curFile.type}' was provided`);
      this.curFileNum++;
      return this.upload();
    }

    let formData = new FormData();
    formData.append("files", curFile);

    return uploadFile(this.socket.id, tempUploadId, formData)
      .then(response => {
        if (response.ok) {
          console.log(`Upload #${this.curFileNum + 1} successfully uploaded.`)
          this.curFileNum++;
          this.upload();
        }
        else if(response.redirected) {
          console.log("do redirect?");
          console.log(response);
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
    let videos = document.querySelector('input[type="file"][multiple]');

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
   * Tells the server to convert an upload.
   */
  convert = (uploadId, quality) => {
    console.log(`convert: ${uploadId}`);
    this.socket.emit("ConvertRequested", { uploadId: uploadId, quality: quality });

    for (let i = 0; i < this.uploads.length; i++) {
      if (this.uploads[i].uploadId === uploadId) {
        this.uploads[i].status = "converting";
        break;
      }
    }

    this.setState({
      uploads: this.uploads
    });
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

    this.setState({ uploads: this.uploads });
    this.curFileNum--;

  }

  /**
   * Tells the server to add gif to database with given tags.
   */
  share = (uploadId, tags, description) => {
    console.log(uploadId);
    console.log(tags);
    console.log(description);

    this.socket.emit("ShareRequest", {
      uploadId: uploadId,
      tags: tags,
      description: description
    });
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

  render() {
    return (
      <Box>
        <Grid
          container
          direction="column"
          justify="space-evenly"
          alignItems="center"
        >
          <Grid item container>
            <DropBox
              onDrop={this.dropHandler}
              onDragOver={this.dragOverHandler}
              onDragLeave={this.dragEndHandler}
              hovering={this.state.filesHovering}
              selectFilesUpload={this.selectFilesUpload}
            />
          </Grid>
        </Grid>

        {/* Upload Wells start here */}
        <Grid
          container
          direction="row"
          justify="space-evenly"
          alignItems="flex-start"
        >
          {/* Padding element */}
          <Grid item sm={2}></Grid>

          {/* The upload container */}
          <Grid item container xs={12} sm={8}>
            {this.state.uploads.map(upload =>
              <Grid item xs={12} key={upload.uploadId + "_grid"}>
                <Upload
                  key={upload.uploadId}
                  uploadId={upload.uploadId}
                  fileName={upload.file.name}
                  size={upload.file.size}
                  percentUploaded={upload.percentUploaded}
                  conversionData={upload.conversionData}
                  status={upload.status}
                  conversionComplete={upload.conversionComplete}
                  requestTagSuggestions={this.requestTagSuggestions}
                  suggestions={upload.suggestions}
                  share={this.share}
                  convert={this.convert}
                  removeUpload={this.removeUpload}
                  servePath={upload.servePath}
                  error={upload.error}
                />
              </Grid>
            )}
          </Grid>

          {/* Padding element */}
          <Grid item sm={2}></Grid>

        </Grid>

      </Box>);
  }
}

export default Uploader;


