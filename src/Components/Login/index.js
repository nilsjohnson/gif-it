import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Paper } from '@material-ui/core';
import { login as getAuthToken } from '../../util/data';
import { saveAuthToken } from '../../util/util';

import { Redirect } from "react-router-dom";

const useStyles = (theme => ({
    paper: {
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
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
    },
    container: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
    }
}));

const MAX_INPUT_LENGTH = 50;

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: props.username,
            pw: props.pw,
            usernameError: false,
            pwError: false,
            message: "",
            redirect: null
        }
    }

    setUsername = (event) => {
        let val = event.target.value;
        // only sets the value if its not unreasonably long
        if (val.length < MAX_INPUT_LENGTH) {
            this.setState({
                username: val,
                usernameError: false,
                message: ""
            });
        }
    }

    setPassword = (event) => {
        let val = event.target.value;
        // only sets the value if its not unreasonably long
        if (val.length < MAX_INPUT_LENGTH) {
            this.setState({
                pw: val,
                pwError: false,
                message: ""
            });
        }
    }

    login = () => {
        if (!this.isValidInput()) {
            return;
        }

        getAuthToken({ usernameOrEmail: this.state.username, pw: this.state.pw })
            .then(res => {
                if (res.ok) {
                    res.json().then(token => {
                        saveAuthToken(token);
                        console.log("redirecting home");
                        this.setState({ redirect: "/" });
                    }).catch(jsonErr => console.log(jsonErr));
                }
                else if (res.status === 409) {
                    this.setState({
                        message: "Invalid username/password"
                    });
                }
            })
            .catch(err => console.log(err));
    }

    isValidInput = () => {
        let usernameError = false;
        let pwError = false;

        if (!this.state.username) {
            usernameError = true;
            console.log("username error found");
        }
        if (!this.state.pw) {
            pwError = true;
            console.log("pw error found");
        }

        this.setState({
            usernameError: usernameError,
            pwError: pwError
        });

        if (usernameError || pwError) {
            return false;
        }
        return true;
    }

    render() {
        const { classes } = this.props;

        if(this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return (
            <Container component="main" maxWidth="xs" >
                <Paper className={classes.container}>
                    <div className={classes.paper}>
                        <Typography component="h1" variant="h5" gutterBottom={true}>
                            Log In
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    error={this.state.usernameError}
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={this.props.username}
                                    id="username"
                                    label="Username or Email"
                                    name="usernameOrEmail"
                                    autoComplete="username"
                                    onChange={this.setUsername}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    error={this.state.pwError}
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={this.state.pw}
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    onChange={this.setPassword}
                                />
                            </Grid>
                            {this.state.message &&
                                <Typography component="h5" variant="h5">
                                    {this.state.message}
                                </Typography>}
                        </Grid>
                        <Button
                            onClick={this.login}
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Log In
                            </Button>
                        <Grid container justify="flex-end">
                        </Grid>
                    </div>
                </Paper>
            </Container>
        );
    }
}

export default withStyles(useStyles)(Login);
