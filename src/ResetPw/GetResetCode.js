import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Paper, Box } from '@material-ui/core';

import { Redirect } from "react-router-dom";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { resetPw } from '../util/data';


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

const MAX_INPUT_LENGTH = 75;

class GetResetCode extends Component {
    constructor(props) {
        super(props);

        this.state = {
            emailAddr: "",
            message: "",
            redirect: null
        }
    }

    onEnterPressed = (event) => {
        if (event.keyCode === 13) {
            this.resetPw();
        }
    }

    resetPw = () => {
        let email = this.makeEmail(this.state.emailAddr);
        if (!this.isValidEmailAddr(email)) {
            this.setState({
                message: "Please enter a valid email address."
            });
            return;
        }

        resetPw(this.state.emailAddr).then(res => {
            console.log(res);
            if(res.ok) {
                this.setState({message: "Check email to get reset link. (Look in spam folder if you dont see it. Also, it may take a few minutes to receive the email.)"})
            }
            else if(res.status === 400) {
                console.log(res);
                res.text().then(text => {
                    this.setState({message: text})
                }).catch(err => console.log(err));
                
            }
        }).catch(err => console.log(err));
    }

    makeEmail = (str) => {
        str = str.trim();
        if(str.length > MAX_INPUT_LENGTH) {
            str = str.substring(0, MAX_INPUT_LENGTH-1);
        }
        return str;
    }

    isValidEmailAddr = (email) => {
        // eslint-disable-next-line
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    setEmailAddr = (event) => {
        this.setState({
            emailAddr: event.target.value,
            message: ""
        });
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
                    <Paper className={classes.container}>
                        <div className={classes.paper}>
                            <Typography component="h1" variant="h5" gutterBottom={true}>
                                Reset Password
                            </Typography>
                                <TextField
                                    error={this.state.usernameError}
                                    variant="outlined"
                                    fullWidth
                                    label="Email"
                                    autoComplete="email"
                                    onChange={this.setEmailAddr}
                                    onKeyDown={this.onEnterPressed}
                                />


                                {this.state.message &&
                                    <Typography variant="subtitle1">
                                        {this.state.message}
                                    </Typography>}

                                <Button
                                    onClick={this.resetPw}
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                >
                                    Email Login Code
                            </Button>
                        </div>
                    </Paper>
                </Container>
                <Footer />
            </Box>
        );
    }
}

export default withStyles(useStyles)(GetResetCode);
