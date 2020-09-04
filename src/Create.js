import React, { Component } from "react";
import Uploader from "./Components/Uploader";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box"
import { Container, Typography } from "@material-ui/core";

class Create extends Component {
  render() {
    return (
      <Box>
        <Header />
        <Container>
          <Box m={2}>
            <Typography align="center" variant="h4" gutterBottom>
              Make a Gif.
      </Typography>
          </Box>

          <Uploader />
        </Container>
      </Box>
    );
  }
}

export default Create;


