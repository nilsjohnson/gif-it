import React, { Component } from "react";
import './App.css';
import Header from "./Components/Header";
import { getNew } from "./util/data";


class Explore extends Component { 
  constructor(props) {
    super(props);

    this.state = ({
      gifs: []
    });
  }

  setGifs = (gifs) => {
    this.setState({
      gifs: gifs
    })
  }

  componentDidMount() {

    let cb = this.setGifs;
    getNew()
    .then((response) => {
      response.json().then((jsn) => {
        cb(jsn);
        console.log(jsn);
      });
    })
    .catch((err) => {
      console.log(err);
    })
  }

  render() {
    return (
      <div>
        <Header/>
        
        <div className="container-vert">
           {this.state.gifs.map(gif => 
            <img className="img-responsive" key={gif.filename} src={"/" + gif.filename}/>
          )}
        </div>
      </div>
     
    );
  }
}

export default Explore;
