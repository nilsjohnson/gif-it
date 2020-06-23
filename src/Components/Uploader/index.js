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

class Uploader extends Component {
  constructor(props) {
    super(props);
  
    this.state = ({
      response: "Please Choose file to convert to .gif",
      gif: "",
      fileNames: []
    });
  }

  setResponse = (data) => {
    this.setState({
      response : data
    });
  }

  upload = () => {
    var socket = socketIOClient();

    socket.on("FromAPI", data => {
      this.setResponse(data);
    });
    socket.on("complete", data => {
      console.log("data: " + data);
      this.showGif(data);
    });

    socket.on("connect", () => {
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
  
  dropHandler = (event) => {
    alert(event);
    event.preventDefault();
    console.log("file dropped");
    this.setState({
      fileNames: ["file,", "antoher"]
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
              <IndvidualWell key = {"fileName"} fileName={"fileName"} size={"12345 kb"}/>
            )
          }
        </div>
      </div>
      
    );
  }
}

export default Uploader;


