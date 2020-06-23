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

let files = [];

class Uploader extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      response: "Please Choose file to convert to .gif",
      gif: "",
      fileNames: []
    });

    let socket;
  }

  setResponse = (data) => {
    this.setState({
      response: data
    });
  }

  createSocket = () => {

  }

  upload = () => {
    this.socket = socketIOClient();

    this.socket.on("FromAPI", data => {
      this.setResponse(data);
    });
    this.socket.on("complete", data => {
      console.log("data: " + data);
      this.showGif(data);
    });

    this.socket.on("connect", () => {
      let videos = document.querySelector('input[type="file"][multiple]');

      // uploads each individual file
      for (let i = 0; i < videos.files.length; i++) {
        let formData = new FormData();
        formData.append('video', videos.files[i]);

        uploadFile('/api/videoUpload', formData)
          .then(response => {
            if (response.ok) {
              console.log(response);
            }
          })
          .catch(error => console.error('Error: ', error));
      }
      videos.value = "";

    });
  }

  showGif = (gifName) => {
    this.setState({
      gif: gifName
    })
  }

  // when the user drops the files into the box
  dropHandler = (ev) => {
    ev.preventDefault();
    console.log("drop");



    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          console.log('... file[' + i + '].name = ' + file.name);
          files.push(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        files.push(ev.dataTransfer.files[i]);
      }
    }

    console.log(files);

    let socket = socketIOClient();

    socket.on("FromAPI", data => {
      this.setResponse(data);
    });

    socket.on("complete", data => {
      console.log("data: " + data);
      this.showGif(data);
    });
  
    socket.on("connect", () => {
      console.log("Socket Connected");
      for(let i = 0; i < files.length; i++) {
        console.log(files[i]);
      }

      // uploads each individual file
      for (let i = 0; i < files.length; i++) {
        let formData = new FormData();
        formData.append('video', files[i]);

        uploadFile('/api/videoUpload', formData)
          .then(response => {
            if (response.ok) {
              console.log(response);
            }
          })
          .catch(error => console.error('Error: ', error));
      }
      files = [];

    });
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
          <button onClick={this.upload}>Upload</button>
          <button onClick={this.upload}>Cancel</button>
        </div>
        <div className="container">
          {
            this.state.fileNames.map(fileName =>
              <IndvidualWell key={"fileName"} fileName={"fileName"} size={"12345 kb"} />
            )
          }
        </div>
      </div>

    );
  }
}

export default Uploader;


