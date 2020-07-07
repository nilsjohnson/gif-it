import React, { Component } from "react";
import './css/style.css';
import Header from "./Components/Header";
import { getNew } from "./util/data";
import { Container, Box, GridList, GridListTile } from '@material-ui/core';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';

class Explore extends Component {
  constructor(props) {
    super(props);

    console.log(`width ${props.width}`);

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

  getGridListCols = () => {
    if (this.props.width) {
      console.log("width: " + this.props.width);
    }
    else {
      console.log("was null man!");
    }

    if (isWidthUp('xl', this.props.width)) {
      return 4;
    }

    if (isWidthUp('lg', this.props.width)) {
      return 3;
    }

    if (isWidthUp('md', this.props.width)) {
      return 2;
    }

    return 1;
  }

  render() {
    return (
      <Container>
        <Header />
        <GridList cellHeight={'auto'} cols={this.getGridListCols()} >
          {this.state.gifs.map((gif) => (
            <GridListTile key={gif.id}>
              <Box>
                <img src={gif.filename} />
                <h5>{gif.filename}</h5>
              </Box>
            </GridListTile>
          ))}
        </GridList>
      </Container>

    );
  }
}

export default withWidth()(Explore);