import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import './style.css';
import UploadWell from "./UploadWell";
import { uploadFile } from "../../util/data"

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
      for (let i = 0; i < this.state.uploads.length; i++) {
        if (this.state.uploads[i].fileId === data.fileId) {
          let temp = this.state.uploads;
          // TODO only update percent field
          temp[i] = data;
          this.setState({
            uploads: temp
          });
        }
      }
    });

    /*
      Updates the placeholder upload data with 'real' data
      about the upload from the server.
    */
    this.socket.on("UploadStart", uploadData => {
      console.log(`upload started: ${uploadData}`);

      let tmp = this.state.uploads;
      tmp[this.curUploadNum] = uploadData;

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
      console.log(`'uploadComplete' triggered. Here's the data:`);
      console.log(data);

      let tmp = this.state.uploads;

      for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].fileId === data.fileId) {
          tmp[i].videoLength = data.videoLength;
          tmp[i].uploadedTime = data.uploadedTime;
          tmp[i].uploadComplete = true;
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
    this.socket.on("ConversionComplete", (conversionResult) => {
      console.log(conversionResult);

      let tmp = this.state.uploads;
      for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].fileId === conversionResult.fileId) {
          tmp[i].servePath = conversionResult.fileId + ".gif";
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
        if (tmp[i].fileId === data.fileId) {
          tmp[i].conversionStatus = data.conversionStatus;
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
              uploads : tmp
            });

            this.curUploadNum++;
            this.upload();
          });
        }
      })
      .catch(err =>{
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
        fileId: i,
        size: this.unprocessedFiles[i].size.toString(),
        percentUploaded: 0
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
  convert = (upload) => {
    console.log(`convert: ${upload}`);
    this.socket.emit("ConvertRequested", upload);
  }

  /**
   * Tells the server to add file to database with given tags.
   */
  share = (fileId, path, tags) => {
    console.log("Cher is the best!");
    console.log(tags);
    console.log(fileId);
    this.socket.emit("ShareRequest", { fileId: fileId, path: path, tags: tags });
  }

  render() {
    return (
      <div className={`${this.state.filesHovering ? "choosing-files" : ""}`}
        onDrop={this.dropHandler}
        onDragOver={this.dragOverHandler}
        onDragLeave={this.dragEndHandler}>
        <div className="container">
          <div id="drop-box">
            <div className="container">
              <p>Drag and Drop Files or</p>
            </div>
            <div className="container">
              <input type="file" multiple onChange={this.selectFilesUpload} />
            </div>

          </div>
        </div>
        {this.state.uploads.map(upload =>
          <div className="container" key={upload.fileId}>
            <UploadWell
              key={upload.fileId}
              fileId={upload.fileId}
              fileName={upload.fileName}
              size={upload.size}
              percentUploaded={upload.percentUploaded}
              convert={this.convert}
              servePath={upload.servePath}
              conversionStatus={upload.conversionStatus}
              uploadComplete={upload.uploadComplete}
              videoLength={upload.videoLength}
              share={this.share}
              error={upload.error}
            />
          </div>
        )}
      </div>);
  }
}

export default Uploader;


