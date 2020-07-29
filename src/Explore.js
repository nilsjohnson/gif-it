import React, { Component } from "react";
import Header from "./Components/Header";
import { getNew, search, getPopularTags } from "./util/data";
import { Container, Box, Grid } from '@material-ui/core';
import GifCard from "./Components/GifCard";
import SearchBar from "./Components/SearchBar";
import GifBox from "./Components/GifBox";

class Explore extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      gifs: [],
      curGif: "",
      popularTags: []
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

    let tags = [];
    getPopularTags().then(res => {
      if(res.ok) {
        res.json().then(resJson => {
          console.log(resJson);
          resJson.forEach(elem => {
            tags.push(elem.tag);
            this.setState({popularTags: tags});
          });
        });
      }
      else{
        console.log("Problem fetching popular tags.");
        console.log(res);
      }
    }).catch(err => console.log(`Problem fetching popular tags: ${err}`));
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

  getView = (gifId) => {

    if (gifId) {
      return (
        <GifBox 
          gifId={gifId}
        />

      );
    }
    else {
      return (
        <Box>
          <SearchBar
            search={this.search}
            popularTags={this.state.popularTags}
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
    let gifId = url.searchParams.get("gid");

    return (
      <div>
        <Header />
        <Container>
          {this.getView(gifId)}
        </Container>
      </div>
    );
  }
}

export default Explore;