import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import './style.css';
import UploadWell from "./UploadWell";
import { uploadFile } from "../../util/data"
import { DropBox } from "../DropBox";
import { Grid } from "@material-ui/core";

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

    // the socket for this upload session
    this.socket = null;
    // The current upload. We upload 1 file at a time.
    this.curUploadNum = 0;
    // holding bin for files after the user has dragged/dropped or selected them.
    this.unprocessedFiles = [];
  }

  // to flag or unflag if a user is dragging files over the drop-zone
  setFilesHovering = (val) => {
    this.setState({
      filesHovering: val
    });
  }

  // adds an object representing a file uploaded to server.
  // object will intitially be a placeholder which will be 
  // gradually upldated as the session progresses
  addUploads = (uploads) => {
    console.log(this.state.uploads);
    this.setState({
      uploads: [
        ...this.state.uploads,
        ...uploads,
      ],
    });
  }

  /*
    opens the socket and defines the communication actions.
  */
  createSocket = () => {
    this.socket = socketIOClient();

    /*
      to handle upload progress updates
    */
    this.socket.on("UploadProgress", data => {
      console.log("up progress");
      console.log(data);
      let temp = this.state.uploads;

      for (let i = 0; i < temp.length; i++) {
        if (temp[i].uploadId === data.uploadId) {
          temp[i].percentUploaded = data.percentUploaded;
          console.log("percent set..");
          break;
        }
      }

      this.setState({
        uploads: temp
      });

    });

    /*
      Updates the placeholder upload data with 'real' data
      about the upload from the server.
    */
    this.socket.on("UploadStart", data => {
      console.log('Upload Started, upload object returned: ');
      console.log(data);

      let tmp = this.state.uploads;
      tmp[this.curUploadNum].status = "uploading";
      tmp[this.curUploadNum].uploadId = data.uploadId;

      this.setState({
        uploads: tmp
      });

    });

    /*
      Provides the upload with metadata about the video to 
      determine conversion options and marks the upload as complete.
      Note: the next upload gets triggered by a 200 from the POST and not here.
    */
    this.socket.on("uploadComplete", (data) => {
      console.log(`Upload Complete: `);
      console.log(data);

      let tmp = this.state.uploads;

      for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].uploadId === data.uploadId) {
          tmp[i].status = "settingOptions";
          break;
        }
      }

      this.setState({ uploads: tmp });
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

      let tmp = this.state.uploads;
      for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].uploadId === data.uploadId) {
          console.log("found it!");
          console.log(tmp[i]);
          tmp[i].servePath = data.servePath;
          tmp[i].status = "complete";
          break;
        }
      }
      this.setState({
        uploads: tmp
      });

    });

    /**
     * To handle conversion progress updates
     */
    this.socket.on("ConversionProgress", (data) => {
      console.log(data);
      let tmp = this.state.uploads;
      for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].uploadId === data.uploadId) {
          tmp[i].conversionData = data.conversionData;
          break;
        }
      }

      this.setState({
        uploads: tmp
      });
    });
  }

  /**
   * Takes files from unprocessedFiles and recursively uploads them.
   */
  upload = () => {
    if (this.unprocessedFiles.length === 0) { return; }

    let formData = new FormData();
    formData.append("files", this.unprocessedFiles.shift());

    return uploadFile('/api/videoUpload/' + this.socket.id, formData)
      .then(response => {
        if (response.ok) {
          console.log(`Upload #${this.curUploadNum + 1} successfully uploaded.`)
          this.curUploadNum++;
          this.upload();
        }
        else {
          console.log("response not ok..");
          response.json().then(resJson => {
            console.log(resJson);

            let tmp = this.state.uploads;
            tmp[this.curUploadNum].error = resJson.err;
            this.setState({
              uploads: tmp
            });

            this.curUploadNum++;
            this.upload();
          });
        }
      })
      .catch(err => {
        console.log("Upload error:" + err)
        this.curUploadNum++;
        this.upload();
      });
  }

  /**
   * Adds placeholder objects to the stateful upload array
   * so the user knows what files are waiting to be uploaded,
   * then kicks off the upload.
   */
  initUpload = () => {
    let placeHoldrs = [];
    for (let i = 0; i < this.unprocessedFiles.length; i++) {
      let temp = {
        fileName: this.unprocessedFiles[i].name,
        uploadId: "temp_id_" + i,
        size: this.unprocessedFiles[i].size.toString(),
        percentUploaded: 0,
        status: "uploading"
      }
      placeHoldrs.push(temp);
    }

    this.addUploads(placeHoldrs);
    if (this.socket === null) {
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
  convert = (uploadId) => {
    console.log(uploadId);
    console.log(`convert: ${uploadId}`);
    this.socket.emit("ConvertRequested", uploadId);

     let tmp = this.state.uploads;
      for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].uploadId === uploadId) {
          tmp[i].status = "converting";
          break;
        }
      }

      this.setState({
        uploads: tmp
      });
  }

  removeUpload = (uploadId) => {
    console.log(`removing upload ${uploadId}`);
    let tmp = this.state.uploads;
    let i = 0;

    while (i < tmp.length) {
      if(tmp[i].uploadId === uploadId) {
        tmp.splice(i, 1);
        break;
      }
      i++;
    }

    this.setState({uploads: tmp});
    this.curUploadNum--;

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
      <Grid
        container
        direction="column"
        justify="space-evenly"
        alignItems="center"
        spacing={2}
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

        
        {this.state.uploads.map(upload =>
            <UploadWell
              key={upload.uploadId}
              uploadId={upload.uploadId}
              fileName={upload.fileName}
              size={upload.size}
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
        )}
      </Grid>);
  }
}

export default Uploader;


