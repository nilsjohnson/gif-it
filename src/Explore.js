import React, { Component } from "react";
import Header from "./Components/Header";
import { getNew, search } from "./util/data";
import { Container, Box, Grid } from '@material-ui/core';
import GifCard from "./Components/GifCard";
import SearchBar from "./Components/SearchBar";
import GifBox from "./Components/GifBox";

/**
 * Component handles searching and fetching gifs
 */
class Explore extends Component {
  constructor(props) {
    super(props);
    
    this.state = ({
      gifs: []
    });
  }

  /**
   * Checks the window for a 'gid' (gif id) param 
   * @return the gif id if present otherwise null
   */
  getGifParam = () => {
    let url = new URL(window.location.href);
    return url.searchParams.get("gid");
  }

   /**
   * Checks the window for a 'search' param 
   * @return the search query if present, otherwise null
   */
  getSearchParam = () => {
    let url = new URL(window.location.href);
    return url.searchParams.get("search");
  }

  /**
   * searches for new gifs and adds them to state
   */
  getNew = () => {
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

  /**
   * Searches for a query
   * @param {*} query The search input
   */
  search = (query) => {
    search(query).then(res => {
      if (res.ok) {
        res.json().then(resJson => {
          this.setGifs(resJson)
        }).catch(err => console.log(`Problem parsing JSON from request: ${err}`))
      } else {
        res.json().then(resJson => {
          console.log(resJson);
        }).catch(err => console.log(`Problem parsing JSON from request: ${err}`))
      }
    }).catch(err => console.log(`Problem fetching gifs: ${err}`));
  }

  /**
   * helper function set the state after a search
   */ 
  setGifs = (gifs) => {
    this.setState({
      gifs: gifs
    })
  }

  /**
   * helper function for render
   */
  getView = () => {
    let curGif = this.getGifParam();
    let searchInput = this.getSearchParam();
    searchInput = (searchInput ? searchInput : "");

    if (curGif) {
      return (
        <GifBox
          gifId={curGif}
        />
      );
    }
    else {
      return (
        <div>
          <SearchBar
            search={this.search}
            popularTags={[]}
            initialInput={searchInput}
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
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <Header />
        <Container>
          <Box m={2}>
            {this.getView()}
          </Box>
        </Container>
      </div>
    );
  }
}

export default Explore;