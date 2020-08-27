import React, { Component } from "react";
import Uploader from "./Components/Uploader";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box"
import { Container, Paper } from "@material-ui/core";
import NewUser from "./Components/Login/NewUser";

class SignUp extends Component {
    render() {
        return (
            <Box>
                <Header />
                <Container>
                    <NewUser />
                </Container>
            </Box>
        );
    }
}

export default SignUp;
