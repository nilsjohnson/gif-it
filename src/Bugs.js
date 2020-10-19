import React, { Component } from "react";
import Header from "./Components/Header";
import { Link, Grid, Container, TextField, Box, Card, Button, Typography } from "@material-ui/core";
import Footer from "./Components/Footer";
import { submitBugReport } from "./util/data";
import { Redirect } from "react-router";


class Bugs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            enteredText: "",
            redirect: false
        };
    }

    onTextChange = (event) => {
        this.setState({
            enteredText: event.target.value
        });
    }

    submitReport = () => {
        if(this.state.enteredText === "") {
            return;
        }

        submitBugReport({bug: this.state.enteredText}).then(res =>{
            if(res.ok) {
                alert("Thank You, Much Appreciated!");
                this.setState({redirect: true});
            }
            else {
                alert("Ohh Geeze. This is embarassing. We're so broken a bug report wont even go though...Sorry about that..");
            }
        }).catch(err =>  console.log(err));
    }
    

    render() {
        if(this.state.redirect) {
            return (
                <Redirect to={'/'} />
            );
        }

        return (
            <Box>
                <Header />
                <Container maxWidth='sm'>
                    <Card>
                        <Box m={3}>


                            <Grid
                                container
                                direction="column"
                                justify="flex-start"
                                alignItems="center"
                                spacing={3}
                            >
                                <Typography gutterBottom variant="h4" component="h2" align='center'>
                                    Submit Bug Report
                                </Typography>
                                <TextField
                                    multiline fullWidth={true} rows={4}
                                    label={"Please Describe Bug"}
                                    variant="outlined" onChange={this.onTextChange}
                                    value={this.state.enteredText}
                                />
                                <Grid item>
                                    <Button onClick={this.submitReport} color="primary" variant='contained'>Submit</Button>
                                </Grid>
                                <Grid container item justify="flex-end">
                                    <Grid item>
                                        <Link href="https://github.com/nilsjohnson/gif-it/issues" variant="body2">
                                            Or, on Github.
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Card>
                </Container>
                <Footer/>
            </Box>
        );
    }
}

export default Bugs;
