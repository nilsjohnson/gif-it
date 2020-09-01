import React, { Component } from "react";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box"
import { Container } from "@material-ui/core";
import MakeAccount from "./Components/MakeAccount";


class SignUp extends Component {
    render() {
        return (
            <Box>
                <Header />
                <Container>
                   <MakeAccount/>
                </Container>
            </Box>
        );
    }
}

export default SignUp;
