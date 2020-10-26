import React from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AppBarCollapse from "./AppBarCollapse";

const useStyles = theme => ({
  navigation: {
    marginBottom: theme.spacing(4)
  }
});

function Header(props) {
  const { classes } = props;
  return (
    <AppBar color={"default"} position="static" className={classes.navigation}>
      <Toolbar >
        <Typography
          variant="h4"
          color="inherit"
          component="h1"
        >
          gif-it.io
        </Typography>
        <AppBarCollapse />
      </Toolbar>
    </AppBar>
  );
}


export default withStyles(useStyles)(Header);
