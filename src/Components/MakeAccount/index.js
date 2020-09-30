import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Paper } from '@material-ui/core';
import { signUp } from '../../util/data';
import Login from '../Login';
import { saveAuthToken } from '../../util/util';
import { Redirect } from 'react-router';

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

class MakeAccount extends Component {
    constructor(props) {
        super(props);

        this.state = {
            desiredUsername: "",
            desiredUsernameErr: false,
            email: "",
            emailErr: false,
            pw: "",
            pwErr: false,
            agree: false,
            errMsg: "",
            redirect: false
        };
    }

    handleEnter = (event) => {
        if (event.keyCode === 13) {
            this.signUp();
        }
    }

    setDesiredUsername = (event) => {
        let val = event.target.value;
        let err = false;
        let errMsg = "";

        // 20 is the max that db will allow
        if (val.length > 20) {
            err = true;
            errMsg = "Username must be less than 20 characters.";
        }

        this.setState({
            desiredUsername: val,
            desiredUsernameErr: err,
            errMsg: errMsg
        });
    }

    setEmail = (event) => {
        let val = event.target.value;
        this.setState({
            email: val,
            emailErr: false
        });
    }

    setPw = (event) => {
        let val = event.target.value;
        let pwErr = false;
        let errMsg = "";

        // 128 was chosen arbitrarily
        if (val.length > 128) {
            pwErr = true;
            errMsg = "It's really great that you're choosing a nice long password, but please, keep it <= 128 characters.";
        }

        this.setState({
            pw: val,
            pwErr: pwErr,
            errMsg: errMsg
        });
    }

    setAgree = (event) => {
        let val = event.target.checked;
        console.log(val);
        this.setState({
            agree: val
        });
    }

    signUp = () => {
        if (!this.checkInput()) {
            console.log("Invalid input. Please Fix.");
            return;
        }

        if (!this.state.agree) {
            alert("You must be at least 13 years of age and promise to be behave in a wholesome manner on gif-it.io");
            return;
        }

        let newUserObj = {
            desiredUsername: this.state.desiredUsername.trim(),
            email: this.state.email.trim(),
            pw: this.state.pw,
        };

        signUp(newUserObj).then(res => {
            if (res.status === 201) {
                res.text().then(token => {
                    console.log("token: " + token);
                    saveAuthToken(token);
                    console.log("Account Created.");
                    this.setState({ redirect: true });
                }).catch(err => console.log(err));
            }
            else {
                console.log(res);
                res.text().then(text => {
                    this.setState({
                        errMsg: text
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            }
        })
    }


    isValidEmailAddr = (email) => {

        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    checkInput = () => {
        if (this.state.pwErr || this.state.desiredUsernameErr) {
            // there is already a visble error. We dont need to check.
            return false;
        }

        let pwErr = false;
        let emailErr = false;
        let desiredUsernameErr = false;
        let errMsg = "";

        if (this.state.pw.length < 4) {
            errMsg += "Password must be at least 4 characters.";
            pwErr = true;
        }
        if (!this.isValidEmailAddr(this.state.email)) {
            errMsg += " Email is not valid.";
            emailErr = true;
        }
        if (this.state.desiredUsername.length === 0) {
            desiredUsernameErr = true;
        }

        this.setState({
            desiredUsernameErr: desiredUsernameErr,
            emailErr: emailErr,
            pwErr: pwErr,
            errMsg: errMsg.trim()
        });

        if (pwErr || emailErr || desiredUsernameErr) {
            return false;
        }
        return true;
    }

    render() {
        const { classes } = this.props;

        if (this.state.redirect) {
            return <Redirect to="/dashboard" />
        }

        return (
            <Container component="main" maxWidth="xs" >
                <Paper className={classes.container}>
                    <div className={classes.paper}>
                        <Typography component="h1" variant="h5" gutterBottom={true}>
                            Sign up
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    onChange={this.setDesiredUsername}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="username"
                                    error={this.state.desiredUsernameErr}
                                    label="Username"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    onChange={this.setEmail}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    error={this.state.emailErr}
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    onChange={this.setPw}
                                    onKeyDown={this.handleEnter}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    error={this.state.pwErr}
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                />
                            </Grid>
                            {this.state.errMsg &&
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">
                                        {this.state.errMsg.toString()}
                                    </Typography>
                                </Grid>
                            }
                            <Grid item xs={12}>
                                <FormControlLabel

                                    control={<Checkbox onChange={this.setAgree} color="primary" />}
                                    label="I am at least 13 years of age and promise to only use gif-it.io for wholesome purposes."
                                />
                            </Grid>
                        </Grid>
                        <Button
                            onClick={this.signUp}
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign Up
                            </Button>

                        <Grid container justify="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Already have an account? Sign in
                                    </Link>
                            </Grid>
                        </Grid>
                    </div>
                </Paper>
            </Container>
        );
    }
}

export default withStyles(useStyles)(MakeAccount);