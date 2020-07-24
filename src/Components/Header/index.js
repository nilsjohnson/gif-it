import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AppBarCollapse from "./AppBarCollapse";

const styles = {
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  navigation: {},
  toggleDrawer: {},
  appTitle: {}
};

function Header(props) {
  const { classes } = props;
  return (
    <AppBar position="static" className={classes.navigation}>
      <Toolbar>
        <Typography
          variant="h4"
          color="inherit"
          component="h1"
          className={classes.appTitle}
        >
          gif-it.io
        </Typography>
        <AppBarCollapse />
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Header);
