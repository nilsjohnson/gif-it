import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import { withStyles } from '@material-ui/styles';
import { Box, Grid } from '@material-ui/core';
import AddTag from './AddTag';
import { getPopularTags } from '../../util/data';
import { MAX_SEARCH_INPUT_LENGTH } from '../../util/const';

const styles = (theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
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
  inputError: {
    border: `2px solid ${theme.palette.error.light}`
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
      input: props.initialInput,
      inputError: false,
      popularTags: []
    };
  }

  componentDidMount = () => {
    if (this.props.initialInput) {
      this.search();
    }

    let tags = [];
    getPopularTags().then(res => {
      if (res.ok) {
        res.json().then(resJson => {
          resJson.forEach(elem => {
            tags.push(elem.tag);
          });
          this.setState({ popularTags: tags }); 
        });
      }
      else {
        console.log("Problem fetching popular tags.");
        console.log(res);
      }
    }).catch(err => console.log(`Problem fetching popular tags: ${err}`));


  }

  setInput = (event) => {
    let input = event.target.value;
    let err = false;
    
    if(input.length > MAX_SEARCH_INPUT_LENGTH) {
      err = true;
      console.log(`Input to search bar must not exceed ${MAX_SEARCH_INPUT_LENGTH} characters.`);
    }

    this.setState({
      inputError: err,
      input: event.target.value
    });
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
    this.setState({
      input: tag
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
              {/* classes.searchContainer + " " + classes.inputError */}
              <Paper className={`${classes.searchContainer} ${this.state.inputError ? classes.inputError : ""}`} >
                <InputBase
                  onKeyDown={this.handleEnter}
                  onChange={this.setInput}
                  className={classes.input}
                  placeholder="Search For Gifs"
                  inputProps={{ 'aria-label': 'Search For Gifs' }}
                  value={this.state.input}
                  label={"hello"}
                />
                <IconButton onClick={this.search} className={classes.iconButton} aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Paper>
                {this.state.inputError ? <Box m={1}>{`Input cannot exceed ${MAX_SEARCH_INPUT_LENGTH} characters.`}</Box>: ""}
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                spacing={2}
              >
                <Box p={1}>
                  <p>Try a popular tag like {
                    this.state.popularTags.map((tag, index, arr) =>
                      <span key={index}>
                        <AddTag tag={tag} addTagToSearch={this.addTagToSearch} />
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

SearchBar.propTypes = {
  initialInput: PropTypes.string,
  search: PropTypes.func
};


export default withStyles(styles)(SearchBar);
