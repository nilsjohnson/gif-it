import React, { Component } from "react";
import Uploader from "./Components/Uploader";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box"
import { Container, Typography } from "@material-ui/core";
import { Redirect } from 'react-router-dom'
import { checkToken } from './util/data';

class Dashboard extends Component {
    constructor(props){
        super(props);

        this.state = {
            redirect: false
        };


    }

    componentDidMount = () => {
        console.log("mounted");
        checkToken().then(res => {
            if(!res.ok) {
                this.setState({redirect: true});
            }
        }).catch(err => console.log(err));
    }

    render() {

        if(this.state.redirect) {
            return (<Redirect to='/login' />)
        }


        return (
            <Box>
                <Header />
                <Container>
                    <Box m={2}>
                        <Typography align="center" variant="h4" gutterBottom>
                            Make a Gif!
                        </Typography>
                        <Uploader/>
                    </Box>
                </Container>
            </Box>
        );
    }
}

export default Dashboard;

