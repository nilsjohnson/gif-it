import React, { Component } from "react";
import './css/style.css';
import Uploader from "./Components/Uploader";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box"
import { Container } from "@material-ui/core";

class Home extends Component { 
  render() {
    return (
      <Box>
        <Header/>
        <Container>
        <Uploader/>
      </Container>
      </Box>
    );
  }
}

export default Home;


