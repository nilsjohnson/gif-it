import React, { Component } from "react";
import { Button, Grid, MenuItem, Box } from "@material-ui/core";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import ButtonAppBarCollapse from "./ButtonBarCollapse";
import { checkToken, signOut } from '../../util/data'
import { deleteAuthToken, saveUserId } from "../../util/util";
import { Redirect } from 'react-router-dom';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DashboardIcon from '@material-ui/icons/Dashboard';
import SearchIcon from '@material-ui/icons/Search';

const styles = theme => ({
    root: {
        position: "absolute",
        right: 0
    },
    buttonBar: {
        [theme.breakpoints.down(750)]: {
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
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(.5),
        marginTop: theme.spacing(.5)
    },
    collapseBox: {
        display: 'flex',
        flexDirection: 'column',
        width: 300
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
                res.json().then(resJson => {
                    console.log(resJson);
                    saveUserId(resJson.userId);
                }).catch(err => console.log(err));
            }
            else if (res.status === 401) {
                this.setState({ authenticated: false });
            }
        }).catch(err => console.log(err));
    }

    doSignOut = () => {
        signOut().then(res => {
            // regardless if response is ok,
            // delete the auth token and redirect
            deleteAuthToken();
            this.setState({
                redirect: "/?out=true",
                authenticated: false
            });

        }).catch(err => {
            // if request didnt go through, we still delete token and redirect.
            deleteAuthToken();
            this.setState({
                redirect: "/?out=true",
                authenticated: false
            });
        });
    }

    /**
     * @ returns Buttons for each navbar item
     */
    getItems = () => {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Button className={classes.btn}
                    startIcon={<SearchIcon />}
                    className={classes.btn}
                    variant="contained"
                    color="primary"
                    href='./'>
                    Explore
                </Button>

                <Button className={classes.btn}
                    startIcon={<CloudUploadIcon />}
                    className={classes.btn}
                    variant="contained"
                    color="primary"
                    href='./upload'>
                    Upload
                </Button>

                <Button className={classes.btn}
                    startIcon={<DashboardIcon />}
                    className={classes.btn}
                    variant="contained"
                    color="primary"
                    href='./dashboard'>
                    Dashboard
                </Button>
                {this.state.authenticated
                    ?
                    <React.Fragment>
                        <Button className={classes.btn}
                            variant="contained"
                            color="secondary"
                            onClick={this.doSignOut}>
                            Sign Out
                        </Button>
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <Button className={classes.btn}
                            variant="outlined"
                            color="primary"
                            href='./login'>
                            Log In
                        </Button>
                        <Button className={classes.btn}
                            variant="contained"
                            color="secondary"
                            href='./signup'>
                            Sign Up
                        </Button>
                    </React.Fragment>
                }
            </React.Fragment>
        );
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                {this.state.redirect && <Redirect to={this.state.redirect} />}
                <ButtonAppBarCollapse>
                    <Box className={classes.collapseBox}>
                        {this.getItems()}
                    </Box>
                </ButtonAppBarCollapse>
                <div className={classes.buttonBar}>
                    {this.getItems()}
                </div>
            </div>

        );
    }
}

export default withStyles(styles)(AppBarCollapse);
