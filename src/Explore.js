import React, { Component } from "react";
import './css/style.css';
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
        <div className="tile-box">
           {this.state.gifs.map(gif =>
            <div className="tile-box-item">
              <img key={gif.filename} src={"/" + gif.filename}/>
           <h4>{gif.filename}</h4>
            </div> 
          )}
        </div>
      </div>
     
    );
  }
}

export default Explore;
