import React, { Component } from "react";
import './App.css';
import Uploader from "./Components/Uploader";
import Header from "./Components/Header";


class App extends Component {
  constructor(props) {
    super(props);
  
  }
  
  render() {
    return (
      <div>
        <Header/>
        
        <div className="container">
          <Uploader/>
        </div>
      </div>
     
    );
  }
}

export default App;


