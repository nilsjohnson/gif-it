import React, { Component } from "react";
import { getNew, search } from "./util/data";
import { Container, Grid, Typography } from '@material-ui/core';
import Header from "./Components/Header";
import MediaCard from "./Components/MediaCard";
import SearchBar from "./Components/SearchBar";
import MediaBox from "./Components/MediaBox";
import Album from "./Components/Album";
import Footer from "./Components/Footer";


/**
 * Component handles searching and fetching gifs
 */
class Explore extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      media: [],
      message: ''
    });

    this.noUrlParms = true;
  }

  componentDidMount = () => {
    if (this.noUrlParms) {
      this.getNew();
    }
  }

  /**
   * Checks the window for a media id 
   * @return the gif id if present otherwise null
   */
  getMediaParam = () => {
    let url = new URL(window.location.href);
    return url.searchParams.get("mId");
  }

  /**
  * Checks the window for a 'search' param 
  * @return the search query if present, otherwise null
  */
  getSearchParam = () => {
    let url = new URL(window.location.href);
    return url.searchParams.get("search");
  }

  getAlbumParam = () => {
    let url = new URL(window.location.href);
    return url.searchParams.get("albumId");
  }

  /**
   * checks the window to see if a user just logged out.
   */
  isLogoutRedirect = () => {
    let url = new URL(window.location.href);
    return url.searchParams.get("out") === 'true';
  }


  /**
   * searches for new gifs and adds them to state
   */
  getNew = () => {
    getNew().then(res => {
      if (res.ok) {
        console.log(res);
        res.json().then(resJson => {
          console.log(resJson);
          this.setMedia(resJson)
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
          if (resJson.length === 0) {
            this.setState({
              message: "Sorry, no results found. :( ",
              media: resJson
            });
          }
          else {
            this.setMedia(resJson);
          }
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
  setMedia = (media) => {
    this.setState({
      media: media,
      message: ''
    });
  }

  /**
   * helper function for render
   */
  getView = () => {

    let mId = this.getMediaParam();
    let searchInput = this.getSearchParam();
    let albumId = this.getAlbumParam();
    searchInput = (searchInput ? searchInput : "");

    if (mId || albumId) {
      this.noUrlParms = false;

      return (
        <React.Fragment>
          {mId
            ?
            <Container disableGutters={true} maxWidth="sm" >
              <MediaBox
                mId={mId}
              />
            </Container>
            :
            <Container disableGutters={true} maxWidth="lg" >
              <Album
                albumId={albumId}
              />
            </Container>}
        </React.Fragment>
      );
    }
    else {
      return (
        <Container maxWidth='lg'>
          {this.isLogoutRedirect() &&
            <Typography align='center' variant="h6">
              You are now logged out.
          </Typography>
          }
          <SearchBar
            search={this.search}
            initialInput={searchInput}
          />
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
            spacing={2}
          >
            {/* linkAddress, src, altText, description  */}
            {this.state.media.map((media, index) => (
              <Grid item xs={12} sm={6} md={4} key={media.id}>
                <MediaCard
                  key={index}
                  media={media}
                />
              </Grid>
            ))}

            {this.state.message &&
              <Grid item xs={12}>
                <Typography align='center' variant="h6">Sorry! No Results.</Typography>
              </Grid>}
          </Grid>
        </Container>
      );
    }
  }

  render() {
    return (
      <div>
        <Header />
        <div>
          {this.getView()}
        </div>
        <Footer />
      </div>
    );
  }
}

export default Explore;