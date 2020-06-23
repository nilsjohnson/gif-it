import React, { Component } from "react";
import socketIOClient from "socket.io-client";
//const ENDPOINT = "http://127.0.0.1:3001";
//const ENDPOINT = "https://gif-it.io";
//const ENDPOINT = "//localhost:3001";


function uploadFile(url = '', data = {}) {
  return fetch(url, {
    method: 'POST',
    body: data,
  });
}

class App extends Component {
  constructor(props) {
    super(props);
  
    this.state = ({
      response: "Please Choose a video file to convert to .gif",
      gif: ""
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

  
  render() {
    return (
      <div>
        <p>
          {this.state.response}
        </p>
        <input type="file" multiple />
				<button onClick={this.upload}>Upload</button>
        <img className="" src={'/' + this.state.gif}/>
      </div>
    );
  }
}

export default App;


