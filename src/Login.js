import React, { Component } from "react";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box"
import { Container } from "@material-ui/core";
import Login from "./Components/Login";


class SignUp extends Component {
    render() {
        return (
            <Box>
                <Header />
                <Container>
                   <Login/>
                </Container>
            </Box>
        );
    }
}

export default SignUp;
