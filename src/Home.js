import React, { Component } from "react";
import Uploader from "./Components/Uploader";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box"
import { Container, Grid } from "@material-ui/core";

class Home extends Component {
  render() {
    return (
      <Box>
        <Header />
        <Container>
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="flex-start"
          > 
            <Grid item sm={2}></Grid>
            <Grid item sm={8}>
              <h4>
                Please use the uploader below to select video files you wish to convert to gif. Your files wont be shared unless you provide tags and click share after the gif has been rendered. Thanks for checking out my site!
              </h4>
            </Grid>
            <Grid item sm={2}></Grid>
          </Grid>
          <Uploader />
        </Container>
      </Box>
    );
  }
}

export default Home;


