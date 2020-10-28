import React, { Component } from "react";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box"
import { Container } from "@material-ui/core";
import MakeAccount from "./Components/MakeAccount";
import Footer from "./Components/Footer";


class SignUp extends Component {
    render() {
        return (
            <Box>
                <Header />
                <Container>
                   <MakeAccount/>
                </Container>
                <Footer/>
            </Box>
        );
    }
}

export default SignUp;
