import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import { withStyles } from '@material-ui/styles';
import { Box, Grid } from '@material-ui/core';
import AddTag from './AddTag';

const styles = (theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    //backgroundColor: "white",
    borderRadius: theme.spacing(1),
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
  active: {
    fontWeight: "bold"
  }
});

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: ""
    };

    this.arrLength = this.props.popularTags.length;
  }


  setInput = (event) => {
    this.setState({
      input: event.target.value
    })
  }

  handleEnter = (event) => {
    if (event.keyCode === 13) {
      this.search();
    }
  }

  search = () => {
    this.props.search(this.state.input);
  }

  addTagToSearch = (tag) => {
    let tmp = this.state.input;

    this.setState({
      input: tmp.trim() + " " + tag
    }, () => {
      this.search();
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <Box>
        <Grid container item
          direction="row"
          justify="center"
          alignItems="center"
        >
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
                  value={this.state.input}
                />
                <IconButton onClick={this.search} className={classes.iconButton} aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Paper>
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                spacing={2}
              >
                <Box p={1}>
                  <p>Try a popular tag like {
                    this.props.popularTags.map((tag, index, arr) =>
                      <span key={index}>
                        <AddTag tag={tag} addTagToSearch={this.addTagToSearch}/>
                        <span>{index < arr.length - 2 ? ", " : ""}</span>
                        <span>{index === arr.length - 2 ? " or " : ""}</span>
                      </span>
                    )
                  }!</p>
                </Box>

              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={2}></Grid>
        </Grid>
      </Box>
    );

  }
}

export default withStyles(styles)(SearchBar);