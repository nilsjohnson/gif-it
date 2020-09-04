import React, { Component } from "react";
import { Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import ButtonAppBarCollapse from "./ButtonBarCollapse";
import { checkToken, signOut } from '../../util/data'
import { deleteAuthToken } from "../../util/util";

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
            authenticated: false
        };
    }

    componentDidMount = () => {
        console.log("mounted");
        checkToken().then(res => {
            console.log(res);
            if(res.ok) {
                this.setState({authenticated: true});
            }
        }).catch(err => console.log(err));
    }

    doSignOut = () => {
        signOut().then(res => {
            if(res.ok) {
                console.log("sign out success.");
            }
            else {
                console.log("sign out returned " + res.status);
            }
            // regardless, we delete the auth token
            deleteAuthToken();
        }).catch(err => {
            console.log(err);
            // if request didnt go through, we still delete token.
            deleteAuthToken();
        });

        this.setState({ authenticated: false });
    }

    getButtons = () => {
        const { classes } = this.props;
        return (
            <div>
                <Button className={classes.btn} variant="contained" color="primary" href='./'>Explore</Button>
                <Button className={classes.btn} variant="contained" color="primary" href="./create">Convert to .gif</Button>
                {this.state.authenticated 
                ? 
                <span>
                <Button className={classes.btn} variant="outlined" color="primary" href='#'>Profile</Button>
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

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <ButtonAppBarCollapse>
                    {/* <Link to="./">
                        <MenuItem href="./">Convert To Gif</MenuItem>
                    </Link>
                    <Link to="./explore">
                        <MenuItem href='./explore'>Explore</MenuItem>
                    </Link> */}
                    {this.getButtons()}
                </ButtonAppBarCollapse>
                <div className={classes.buttonBar} id="appbar-collapse">
                    {this.getButtons()}
                </div>
            </div>

        );
    }
}

export default withStyles(styles)(AppBarCollapse);
