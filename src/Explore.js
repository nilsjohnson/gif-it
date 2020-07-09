import React, { Component } from "react";
import './css/style.css';
import Header from "./Components/Header";
import { getNew } from "./util/data";
import { Container, TextField, Grid, Button, InputBase } from '@material-ui/core';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import GifCard from "./Components/GifCard";
import { makeStyles } from '@material-ui/core/styles';
import SearchBar from "./Components/SearchBar";




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


  

  render() {


    return (
      <div>
        <Header />
        <Container>
          <Grid container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={1}
          >
            <Grid container
              direction="row"
              justify="center"
              alignItems="center"
              >
                <SearchBar/>

            </Grid>

            {this.state.gifs.map((gif) => (
              <Grid item xs={12} sm={6} md={4} key={gif.id}>
                <GifCard
                  key={gif.id}
                  src={gif.filename}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>
    );
  }
}

export default withWidth()(Explore);