import React, { Component } from "react";
import './css/style.css';
import Uploader from "./Components/Uploader";
import Header from "./Components/Header";


class Home extends Component { 
  render() {
    return (
      <div>
        <Header/>
        <Uploader/>
      </div>
     
    );
  }
}

export default Home;


