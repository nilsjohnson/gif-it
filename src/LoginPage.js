import React, { Component } from "react";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box"
import { Container } from "@material-ui/core";
import Login  from './Components/Login';
import Footer from "./Components/Footer";


class LoginPage extends Component {
    render() {
        return (
            <Box>
                <Header />
                <Container>
                   <Login/>
                </Container>
                <Footer/>
            </Box>
        );
    }
}

export default LoginPage;
