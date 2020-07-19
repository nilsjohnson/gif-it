import React, { Component } from "react";
import Header from "./Components/Header";
import { getNew, search, getGifById } from "./util/data";
import { Container, Box, Grid, Button, InputBase } from '@material-ui/core';
import GifCard from "./Components/GifCard";
import SearchBar from "./Components/SearchBar";

class Explore extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      gifs: [],
      curGif: ""
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
      if (res.ok) {
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
      if (res.ok) {
        res.json().then(resJson => {
          this.setGifs(resJson)
        }).catch(err => console.log(`Problem parsing JSON from request: ${err}`))
      } else {
        console.log(`Server had a problem fetching gifs ${res}`);
      }
    }).catch(err => console.log(`Problem fetching gifs: ${err}`));

  }

  getGif = (gifId) => {
    getGifById(gifId).then(res => {
      if(res.ok) {
        res.json().then(resJson => {
          console.log(resJosn);
        })
      }
    }).catch(err => console.log(err));
  }

  getView = (query) => {

    if (query) {
      return (
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item>
            <Box m={2}>
              <img src={`${query}.gif`} />
            </Box>
          </Grid>
        </Grid>
      );
    }
    else {
      return (
        <Box>
          <SearchBar
            search={this.search}
          />
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
            spacing={2}
          >
            {this.state.gifs.map((gif) => (
              <Grid item xs={12} sm={6} md={4} key={gif.id}>
                <GifCard
                  key={gif.id}
                  src={gif.thumbName}
                  id={gif.id}
                  description={gif.descript}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }
  }

  render() {
    let url = new URL(window.location.href);
    let query = url.searchParams.get("gid");

    return (
      <div>
        <Header />
        <Container>
          {this.getView(query)}
        </Container>
      </div>
    );
  }
}

export default Explore;