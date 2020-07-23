import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import './style.css';
import UploadWell from "./UploadWell";
import { uploadFile } from "../../util/data"
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

    this.curFileNum = 0;
    this.uploads = [];

    // the socket for this upload session
    this.socket = null;
    // holding bin for files after the user has dragged/dropped or selected them.
    this.unprocessedFiles = [];
  }

  // to flag or unflag if a user is dragging files over the drop-zone
  setFilesHovering = (val) => {
    this.setState({
      filesHovering: val
    });
  }

  /*
    opens the socket and defines the communication actions.
  */
  createSocket = () => {
    console.log("creating socket");
    this.socket = socketIOClient();

    /*
      to handle upload progress updates
    */
    this.socket.on("UploadProgress", data => {
      const { uploadId, percentUploaded } = data;

      // console.log("upload prog: ");
      // console.log(data);
      for (let i = 0; i < this.uploads.length; i++) {
        if(this.uploads[i].uploadId === uploadId) {
          this.uploads[i].percentUploaded = percentUploaded;
          console.log("percent set..");
          break;
        }
      }

      this.setState({
        uploads: this.uploads
      });

    });

    /*
      Updates the placeholder upload data with 'real' data
      about the upload from the server.
    */
    this.socket.on("UploadStart", data => {
      console.log('Upload Started, upload object returned: ');
      console.log(data);

      const { fileName, uploadId } = data;

      //let tmp = this.state.uploads;
      for (let i = 0; i < this.uploads.length; i++) {
        if (this.uploads[i].file.name === fileName) {
          this.uploads[i].status = "uploading";
          this.uploads[i].uploadId = uploadId;
        }
      }

      this.setState({
        uploads: this.uploads
      });

    });

    /*
      Provides the upload with metadata about the video to 
      determine conversion options and marks the upload as complete.
      Note: the next upload gets triggered by a 200 from the POST and not here.
    */
    this.socket.on("uploadComplete", (data) => {
      const { uploadId } = data;
   
      for (let i = 0; i < this.uploads.length; i++) {
        if (this.uploads[i].uploadId === uploadId) {
          this.uploads[i].status = "settingOptions";
          console.log(`Marked ${uploadId} as 'settingOptions'`);
          break;
        }
      }

      this.setState({ uploads: this.uploads });
    });

    /**
     * Upon connect, we start uploading.
     */
    this.socket.on("connect", () => {
      console.log(`Socket ${this.socket.id} connected`);
      this.upload();
    });

    /**
     * Marks the conversion as complete so we can serve the .gif
     */
    this.socket.on("ConversionComplete", (data) => {
      console.log(data);
      let { servePath } = data;

      for (let i = 0; i < this.uploads.length; i++) {
        if (this.uploads[i].uploadId === data.uploadId) {
          if (servePath) {
            this.uploads[i].servePath = servePath;
            this.uploads[i].status = "complete";
            break;
          }
          else {
            this.uploads[i].error = "File could not be converted. The video is most likely not a supported format."
          }
        }
      }
      this.setState({
        uploads: this.state.uploads
      });

    });

    /**
     * To handle conversion progress updates
     */
    this.socket.on("ConversionProgress", (data) => {
      // console.log("Conversion Data:");
      // console.log(data);
      for (let i = 0; i < this.uploads.length; i++) {
        if (this.uploads[i].uploadId === data.uploadId) {
          this.uploads[i].conversionData = data;
          break;
        }
      }

      this.setState({
        uploads: this.uploads
      });
    });

    this.socket.on("ShareResult", (data) => {
      console.log("ShareResult hit");
      console.log(data);
      const { message } = data;
      if (message) {
        alert(message);
      }
    });
  }

  /**
   * Takes files from unprocessedFiles and recursively uploads them.
   */
  upload = () => {
    console.log(`Starting upload at index ${this.curFileNum}`);
    console.log(this.uploads);
    if(this.curFileNum >= this.uploads.length) {
      console.log("not uploading.."); 
      return; 
    }

    let curFile = this.uploads[this.curFileNum].file;
    if(curFile.size / (1000 * 1000) > MAX_UPLOAD_SIZE) {
            this.uploads[this.curFileNum].error = `File Must Not Exceed ${formatBytes(MAX_UPLOAD_SIZE*1000*1000)}`;
            this.setState({
              uploads: this.uploads
            });

            this.curFileNum++;
            this.upload();
            return;
    }
    let formData = new FormData();
    formData.append("files", curFile);

    return uploadFile('/api/videoUpload/' + this.socket.id, formData)
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
    for (let i = 0; i < this.unprocessedFiles.length; i++) {
      let temp = {
        uploadId: `temp_id_${i + this.curFileNum}_${this.unprocessedFiles[i].name}`,
        percentUploaded: 0,
        status: "uploading",
        file: this.unprocessedFiles[i]
      }
      this.uploads.push(temp);
    }
    
    // reset this array so that user can add more files and update the state.
    this.unprocessedFiles = [];
    this.setState({ uploads: this.uploads});

    // open the socket if necessary
    if (this.socket === null) {
      // this will trigger an upload.
      this.createSocket();
    }
    else {
      this.upload();
    }
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

  dragOverHandler = (ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
    this.setFilesHovering(true);
  }

  /**
   * Deactivates drop-zone if user hovers but doesn't drop files.
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
   * Tells the server to add file to database with given tags.
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
                <UploadWell
                  key={upload.uploadId}
                  uploadId={upload.uploadId}
                  fileName={upload.file.name}
                  size={upload.file.size}
                  percentUploaded={upload.percentUploaded}
                  conversionData={upload.conversionData}
                  status={upload.status}
                  conversionComplete={upload.conversionComplete}
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


