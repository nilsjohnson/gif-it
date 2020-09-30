import React, { Component } from "react";
import { Button, MenuItem } from "@material-ui/core";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import ButtonAppBarCollapse from "./ButtonBarCollapse";
import { checkToken, signOut } from '../../util/data'
import { deleteAuthToken } from "../../util/util";
import { Redirect } from 'react-router-dom';

const styles = theme => ({
    root: {
        position: "absolute",
        right: 0
    },
    buttonBar: {
        [theme.breakpoints.down("xs")]: {
            display: "none"
        },
        margin: "10px",
        paddingLeft: "16px",
        right: 0,
        position: "relative",
        width: "100%",
        background: "transparent"
    },
    btn: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1)
    },
    btnPrimaryLight: {
        backgroundColor: theme.palette.primary.light,
    }
});

class AppBarCollapse extends Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: false,
            redirect: ""
        };
    }

    componentDidMount = () => {
        checkToken().then(res => {
            if (res.ok) {
                this.setState({ authenticated: true });
            }
            else if(res.status === 401){
                this.setState({ authenticated: false });
            }
        }).catch(err => console.log(err));
    }

    doSignOut = () => {
        signOut().then(res => {
            if (res.ok) {
                console.log("sign out success.");
            }
            else {
                console.log("sign out returned " + res.status);
            }
            // regardless, we delete the auth token and redirect
            deleteAuthToken();
            this.setState({
                redirect: "/?loggedOut=true"
            });

        }).catch(err => {
            console.log(err);
            // if request didnt go through, we still delete token.
            deleteAuthToken();
        });
    }

    // buttons are for not collapsed
    getButtons = () => {
        const { classes } = this.props;
        return (
            <div>
                <Button className={classes.btn} variant="contained" color="primary" href='./'>Explore</Button>
                <Button className={classes.btn} variant="contained" color="primary" href='./dashboard'>Upload</Button>
                {this.state.authenticated
                    ?
                    <span>
                        {/* <Button className={classes.btn} variant="outlined" color="primary" href='#'>Profile</Button> */}
                        <Button className={classes.btn} variant="contained" color="secondary" onClick={this.doSignOut}>Sign Out</Button>
                    </span>
                    :
                    <span>
                        <Button className={classes.btn} variant="outlined" color="primary" href='./login'>Log In</Button>
                        <Button className={classes.btn} variant="contained" color="secondary" href='./signup'>Sign Up</Button>
                    </span>
                }
            </div>
        );
    }

    // links are for collapsed
    getLinks = () => {
        return (
            <div>
                <Link to="./explore">
                    <MenuItem href='./explore'>Explore</MenuItem>
                </Link>
                <Link to="./dashboard">
                    <MenuItem href='./explore'>Explore</MenuItem>
                </Link>
                {this.state.authenticated
                    ?
                    <span>
                        {/* <Link to="./">
                            <MenuItem href="#">Profile</MenuItem>
                        </Link> */}
                        <Link to="#">
                            <MenuItem onClick={this.doSignOut} href="#">Sign Out</MenuItem>
                        </Link>
                    </span>
                    :
                    <span>
                        <Link to="./login">
                            <MenuItem href="./login">Log In</MenuItem>
                        </Link>
                        <Link to="./signup">
                            <MenuItem href="./signup">Sign Up</MenuItem>
                        </Link>
                    </span>
                }
            </div>
        );

    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <ButtonAppBarCollapse>
                    {this.getLinks()}
                </ButtonAppBarCollapse>
                <div className={classes.buttonBar} id="appbar-collapse">
                    {this.getButtons()}
                </div>
            </div>

        );
    }
}

export default withStyles(styles)(AppBarCollapse);
