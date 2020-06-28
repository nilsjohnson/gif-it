import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import './style.css';
import IndvidualWell from "./IndividualWell";

function uploadFile(url = '', data = {}) {
  console.log('build fetch request');
  return fetch(url, {
    method: 'POST',
    body: data
  });
}



class Uploader extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      uploads: [],
      filesHovering: false
    });

    this.socket = null;
    this.curUploadNum = 0;
    this.unprocessedFiles = [];
  }

  // to flag or unflag if a user is dragging files over the drop zone
  setFilesHovering = (val) => {
    this.setState({
      filesHovering: val
    });
  }

  // adds an object representing a file uploaded to server
  addUploads = (uploads) => {
    console.log(this.state.uploads);
    this.setState({
      uploads: [
        ...this.state.uploads,
        ...uploads,
      ],
    });
  }

  createSocket = () => {
    this.socket = socketIOClient();

    // to handle upload progress updates
    this.socket.on("UploadProgress", data => {
      // console.log(data);
      for (let i = 0; i < this.state.uploads.length; i++) {
        if (this.state.uploads[i].fileId === data.fileId) {
          let temp = this.state.uploads;
          temp[i] = data;
          this.setState({
            uploads: temp
          });
        }
      }
    });

    // to create the upload object on this (client) side
    // which will be updated on UploadProgress
    this.socket.on("UploadStart", uploadData => {
      console.log(`upload started: ${uploadData}`);

      let tmp = this.state.uploads;
      tmp[this.curUploadNum] = uploadData;

      this.setState({
        uploads: tmp
      });

    });

    // to signal upload is complete
    this.socket.on("uploadComplete", fileNum => {
      console.log(`File ${fileNum} uploaded`);
      this.curUploadNum ++;
      //this.showGif(data);
    });

    // to POST the data as soon as we are connected
    this.socket.on("connect", () => {
      console.log(`Socket ${this.socket.id} connected`);
      this.upload();
    });

    this.socket.on("ConversionComplete", (conversionResult) => {
      console.log(conversionResult);
      let tmp = this.state.uploads;
      for(let  i = 0; i < tmp.length; i++) {
        if(tmp[i].fileId === conversionResult.fileId) {
          tmp[i].servePath = conversionResult.fileId + ".gif";
          break;
        }
      }

      this.setState({
        uploads: tmp
      });

    });

    this.socket.on("ConversionProgress", (data) => {
      console.log(data);
      let tmp = this.state.uploads;
      for(let  i = 0; i < tmp.length; i++) {
        if(tmp[i].fileId === data.fileId) {
          tmp[i].conversionStatus = data.conversionStatus;
          break;
        }
      }

      this.setState({
        uploads: tmp
      });
    })
  }


  upload = () => {
    let formData = new FormData();
    if(this.unprocessedFiles.length === 0) {
      return;
    }
    
    formData.append("files", this.unprocessedFiles.shift());

    uploadFile('/api/videoUpload/' + this.socket.id, formData)
      .then(response => {
        if (response.ok) {
          console.log("Upload Complete")
        }
        else {
          alert("file too large.");
        }
        // upload next one
        this.upload();
      })
      .catch(error => console.error('Error: ', error));
  }

  initUpload = () => {
    // populates array of temporary objects
    // as placeholders until server responds
    let placeHoldrs = [];
    for(let i = 0; i < this.unprocessedFiles.length; i++) {
      let temp = {
        fileName: this.unprocessedFiles[i].name,
        fileId: i,
        size: this.unprocessedFiles[i].size.toString(),
        percentUploaded: 0
      }
      placeHoldrs.push(temp);
    }

    // add the temp objects and create socket
    this.addUploads(placeHoldrs);
    if(this.socket === null) {
      this.createSocket();
    }
    else {
      this.upload();
    }
  }

  // adds all the files to unproccessedFiles array 
  // if the user selects them from file system
  selectFilesUpload = () => {
    console.log("select files hit!");
    let videos = document.querySelector('input[type="file"][multiple]');

    for (let i = 0; i < videos.files.length; i++) {
      console.log("pushing file: " + videos.files[i].name);
      this.unprocessedFiles.push(videos.files[i]);
    }

    this.initUpload();
  }

  // adds all the files to unproccessedFiles array 
  // if the user selects them from file system
  dropHandler = (ev) => {
    ev.preventDefault();
    console.log("drop handler hit");
    this.setFilesHovering(false);

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          console.log('... file[' + i + '].name = ' + file.name);
          this.unprocessedFiles.push(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var j = 0; j < ev.dataTransfer.files.length; j++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[j].name);
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

  dragEndHandler = (ev) => {
    this.setFilesHovering(false);
  }

  convert = (upload) => {
    console.log(`convert: ${upload}`);
    this.socket.emit("ConvertRequested", upload);
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
        <div className="container">
          <div className="">
            <p>{this.state.response}</p>

            {/* <img className="" src={'/' + this.state.gif}/> */}
          </div>
        </div>
        {
          this.state.uploads.map(upload =>
            <div className="container" key={upload.fileId}>
              <IndvidualWell
                fileId={upload.fileId}
                key={upload.fileId}
                fileName={upload.fileName}
                size={upload.size}
                percentUploaded={upload.percentUploaded} 
                convert={this.convert}
                servePath={upload.servePath}
                conversionStatus={upload.conversionStatus}
                />
            </div>
          )
        }
      </div>

    );
  }
}

export default Uploader;


