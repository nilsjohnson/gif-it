import React, { Component } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3000";


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
    });
  }

  setResponse = (data) => {
    this.setState({
      response : data
    });
  }

  upload = () => {
  
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", data => {
      this.setResponse(data);
    });
    
    socket.on("complete", data => {
      console.log("data: " + data);
      this.redirectToGif(data);
    });
    
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
  }

  redirectToGif = (gifName) => {
		this.props.history.push('/' + gifName);
	}

  
  render() {
    return (
      <div>
        <p>
          {this.state.response}
        </p>
        <input type="file" multiple />
				    <button onClick={this.upload}>Upload</button>
      </div>
    );
  }
}

export default App;


