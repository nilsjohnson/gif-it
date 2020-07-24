import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import { withStyles } from '@material-ui/styles';
import { Box, Grid, FormControl, InputLabel, Select } from '@material-ui/core';



const styles = (theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    width: "100%",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: ""
    };
  }

  setInput = (event) => {
    console.log(event.target.value);
    this.setState({
      input: event.target.value.trim()
    })
  }

  handleEnter = (event) => {
    if (event.keyCode === 13) {
      this.search();
    }
  }

  search = () => {
    console.log("searching for " + this.state.input);
    this.props.search(this.state.input);
  }

  render() {
    const { classes } = this.props;

    return (
      <Box>
        <Grid container item
          direction="row"
          justify="center"
          alignItems="center" >
          <Grid item sm={2}></Grid>
          <Grid item xs={12} sm={8}>
            <Grid container item className={classes.root}>
              <Paper className={classes.searchContainer} >
                <InputBase
                  onKeyDown={this.handleEnter}
                  onChange={this.setInput}
                  className={classes.input}
                  placeholder="Search For Gifs"
                  inputProps={{ 'aria-label': 'Search For Gifs' }}
                />
                <IconButton onClick={this.search} className={classes.iconButton} aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Grid>
          </Grid>
          <Grid item sm={2}></Grid>
        </Grid>
      </Box>
    );

  }
}

export default withStyles(styles)(SearchBar);