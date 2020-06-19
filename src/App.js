import React, { Component } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3001";


function uploadFile(url = '', data = {}) {
  return fetch(url, {
    method: 'POST',
    body: data,
  });
}

function upload() {
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

class App extends Component {
  constructor(props) {
    super(props);
    
    const socket = socketIOClient(ENDPOINT);

    this.state = ({
      response: "lolz",
    });

    
    socket.on("FromAPI", data => {
      this.setResponse(data);
    });

  }

  setResponse = (data) => {
    this.setState({
      response : data
    })
  }
  
  render() {
    return (
      <div>
        <p>
          {this.state.response}
        </p>
        <input type="file" multiple />
				    <button onClick={upload}>Upload</button>
      </div>
    );
  }
}

export default App;

// import React, { useState, useEffect, Component } from 'react';
// import './App.css';
// import openSocket from 'socket.io-client';
// import socketIOClient from "socket.io-client";

// const ENDPOINT = "http://127.0.0.1:3001";//
// //const socket = socketIOClient(ENDPOINT);



  



// // import React, { useState, useEffect } from "react";
// // import socketIOClient from "socket.io-client";
// // const ENDPOINT = "http://127.0.0.1:3001";

// function App() {
//   const [response, setResponse] = useState("");

//   useEffect(() => {
//     const socket = socketIOClient(ENDPOINT);
//     socket.on("FromAPI", data => {
//       setResponse(data);
//     });
//   }, []);

//   return (
//     <p>
//       It's <time dateTime={response}>{response}</time>
//     </p>
//   );
// }

// export default App;


