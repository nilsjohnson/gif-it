import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';
import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';



const styles = (theme) => ({
  root: {
    marginTop: '16px',
    marginBottom: '8px',
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
});

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: ""
    };

    
  }

  search = () => {
    console.log("searching for " + this.state.input);
  }

  render() {
    const { classes } = this.props;

    return (
      <Paper component="form" className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder="Search For Gifs"
          inputProps={{ 'aria-label': 'Search For Gifs' }}
        />
        <IconButton onClick={this.search} className={classes.iconButton} aria-label="search">
          <SearchIcon />
        </IconButton>
        {/* <Button onClick={search}>Search</Button> */}
      </Paper>
    );

  }
}

export default withStyles(styles)(SearchBar);