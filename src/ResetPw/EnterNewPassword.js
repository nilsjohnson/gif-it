import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Paper, Box } from '@material-ui/core';
import { submitNewPassword } from '../util/data';
import { saveAuthToken } from '../util/util';

import { Redirect } from "react-router-dom";
import Header from '../Components/Header';
import Footer from '../Components/Footer';


const useStyles = (theme => ({
    paper: {
        marginTop: theme.spacing(4),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    }
}));

class EnterNewPassword extends Component {
    constructor(props) {
        super(props);

        this.state = {
            password: "",
            passwordConfirm: "",
            redirect: null,
            message: ""
        }
    }

    onEnterPressed = (event) => {
        if (event.keyCode === 13) {
            this.resetPw();
        }
    }

    resetPw = () => {
        if (this.state.password.length < 4) {
            this.setState({
                message: "Please enter at least 4 characters."
            });
            return;
        }
        if (this.state.password !== this.state.passwordConfirm) {
            this.setState({
                message: "Passwords do not match."
            });
            return;
        }

        submitNewPassword(this.getCodeParam(), this.state.password).then(res => {
            if(res.ok) {
                res.json().then(token => {
                    saveAuthToken(token);
                    this.setState({ redirect: "/dashboard" });
                }).catch(jsonErr => console.log(jsonErr));
            }
            else {
                res.text().then(text => {
                    this.setState({
                        message: text
                    });
                }).catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
    }

    setPw = (event) => {
        this.setState({
            password: event.target.value,
            message: ""
        });
    }

    setConfirm = (event) => {
        this.setState({
            passwordConfirm: event.target.value,
            message: ""
        });
    }

    getCodeParam = () => {
        let url = new URL(window.location.href);
        return url.searchParams.get("code");
      }


    render() {
        const { classes } = this.props;

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return (
            <Box>
                <Header />
                <Container component="main" maxWidth="xs" >
                    <Paper className={classes.paper}>
                        <Typography align="center" component="h1" variant="h5"gutterBottom={true}>
                            Reset Password
                            </Typography>
                        <Grid spacing={2}
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="flex-start"
                        >
                            <Grid item xs={12}>
                                <TextField
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    label="Password"
                                    onChange={this.setPw}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                     type="password"
                                    variant="outlined"
                                    fullWidth
                                    label="Confirm Password"
                                    onChange={this.setConfirm}
                                    onKeyDown={this.onEnterPressed}
                                    gutterBottom={true}
                                />
                            </Grid>
                            {this.state.message &&
                                <Grid item xx={12}>
                                    <Typography variant="subtitle1">
                                        {this.state.message}
                                    </Typography>
                                </Grid>}
                            <Grid item xs={12}>
                                <Button
                                    onClick={this.resetPw}
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                >
                                    Reset Password
                        </Button>
                            </Grid>
                        </Grid>




                    </Paper>
                </Container>
                <Footer />
            </Box>
        );
    }
}

export default withStyles(useStyles)(EnterNewPassword);
