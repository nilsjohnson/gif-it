import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
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
          variant="title"
          color="inherit"
          component="h2"
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


// import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
// import Typography from '@material-ui/core/Typography';
// import Button from '@material-ui/core/Button';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//   },
//   btn: {
//     margin: theme.spacing(2),
//   },
//   title: {

//     flexGrow: 1,
//   },
// }));

// export default function Header() {
//   const classes = useStyles();

//   return (
//     <div className={classes.root}>
//       <AppBar position="static">
//         <Toolbar>
//           <Typography variant="h6" className={classes.title}>
//             gif-it.io
//           </Typography>
//           <Button className={classes.btn} variant="outlined" color="secondary" href="./">Convert to .gif</Button>
// 		      <Button className={classes.btn} variant="outlined" color="secondary" href='./explore'>Explore</Button>
//         </Toolbar>
//       </AppBar>
//     </div>
//   );
// }