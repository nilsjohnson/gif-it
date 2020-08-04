import React from "react";
import { Button, MenuItem } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import ButtonAppBarCollapse from "./ButtonBarCollapse";
import { Link } from "react-router-dom";

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
    }
});

const AppBarCollapse = props => (
    <div className={props.classes.root}>
        <ButtonAppBarCollapse>
            <Link to="./">
                <MenuItem href="./">Convert To Gif</MenuItem>
            </Link>
            <Link to="./explore">
                <MenuItem href='./explore'>Explore</MenuItem>
            </Link>
        </ButtonAppBarCollapse>
        <div className={props.classes.buttonBar} id="appbar-collapse">
            <Button className={props.classes.btn} variant="outlined" color="primary" href="./">Convert to .gif</Button>
            <Button className={props.classes.btn} variant="outlined" color="primary" href='./explore'>Explore</Button>
        </div>
    </div>
);

export default withStyles(styles)(AppBarCollapse);
