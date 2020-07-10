import React, { Component } from "react";
import './css/style.css';
import Header from "./Components/Header";
import { getNew, search } from "./util/data";
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

  /**
   * Performs a default search
   */
  componentDidMount() {
    getNew().then(res => {
      if(res.ok) {
        res.json().then(resJson => {
          this.setGifs(resJson)
        }).catch(err => console.log(`Problem parsing JSON from request: ${err}`))
      } else {
        console.log(`Server had a problem fetching gifs ${res}`);
      }
    }).catch(err => console.log(`Problem fetching newest gifs: ${err}`));
  }

  search = (query) => {
    search(query).then(res => {
      if(res.ok) {
        res.json().then(resJson => {
          this.setGifs(resJson)
        }).catch(err => console.log(`Problem parsing JSON from request: ${err}`))
      } else {
        console.log(`Server had a problem fetching gifs ${res}`);
      }
    }).catch(err => console.log(`Problem fetching gifs: ${err}`));

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
              <SearchBar
                search={this.search}
              />

            </Grid>

            {this.state.gifs.map((gif) => (
              <Grid item xs={12} sm={6} md={4} key={gif.id}>
                <GifCard
                  key={gif.id}
                  src={gif.fileName}
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