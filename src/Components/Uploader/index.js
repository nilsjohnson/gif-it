import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import './style.css';
import IndvidualWell from "./IndividualWell";

function uploadFile(url = '', data = {}) {
  return fetch(url, {
    method: 'POST',
    body: data,
  });
}

let unprocessedFiles = [];

class Uploader extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      response: "Please Choose file to convert to .gif",
      gif: "",
      files: []
    });

    let socket;
  }

  addFile = (file) => {
    let temp = this.state.files;
    temp.push(file);
    this.setState({
      files: temp
    });
  }

  setResponse = (data) => {
    this.setState({
      response: data
    });
  }

  createSocket = () => {
    this.socket = socketIOClient();

    this.socket.on("FromAPI", data => {
      this.setResponse(data);
    });

    this.socket.on("complete", data => {
      console.log("data: " + data);
      this.showGif(data);
    });

    this.socket.on("connect", () => {
      console.log("connected!");
      for(let i = 0; i < unprocessedFiles.length; i++) {
        console.log("Upoading file: " + i);
        console.log(this.state.files[i]);
        let formData = new FormData();
        formData.append('video', unprocessedFiles[i]);
        uploadFile('/api/videoUpload', formData)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          else {
            console.log("File Problem");
          }
        })
        .then(resJson => {
          console.log(resJson);
          this.addFile(resJson);
        })
        .catch(error => console.error('Error: ', error));
      }
      
      unprocessedFiles = [];
    });
  }

  selectFilesUpload = () => {
    let videos = document.querySelector('input[type="file"][multiple]');

    // uploads each individual file
    for (let i = 0; i < videos.files.length; i++) {
      console.log("pushing file: " + videos.files[i].name);
      unprocessedFiles.push(videos.files[i]);
    }

    this.createSocket();
  }

  showGif = (gifName) => {
    this.setState({
      gif: gifName
    })
  }

  // when the user drops the files into the box
  dropHandler = (ev) => {
    ev.preventDefault();
    console.log("drop handler hit");

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          console.log('... file[' + i + '].name = ' + file.name);
          unprocessedFiles.push(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        unprocessedFiles.push(ev.dataTransfer.files[i]);
      }
    }

    this.createSocket();
    
  }

  dragStartHandler = (ev) => {
    ev.dataTransfer.setData("application/my-app", ev.target.id);
    ev.dataTransfer.dropEffect = "move";
  }

  dragOverHandler = (ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move"
  }

  render() {
    return (
      <div>
        <div className="container">
          <div id="drop-box"
            onDrop={this.dropHandler}
            onDragOver={this.dragOverHandler}
            onDragStart={this.dragStartHandler}>
            <p>Drag and Drop Files...</p>
          </div>
        </div>
        <div className="container">
          <div className="">
            <p>{this.state.response}</p>
            <input type="file" multiple />
            {/* <img className="" src={'/' + this.state.gif}/> */}
          </div>
        </div>
        <div className="container">
          <button onClick={this.selectFilesUpload}>Upload</button>
          <button>Cancel</button>
        </div>
        <div className="container">
          {
            this.state.files.map(file =>
              <IndvidualWell key={file.newName} fileName={file.newName} size={file.size} />
            )
          }
        </div>
      </div>

    );
  }
}

export default Uploader;


