import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
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

  setInput = (event) => {
    console.log(event.target.value);
    this.setState({
      input: event.target.value.trim()
    })
  }

  handleEnter = (event) => {
    if(event.keyCode === 13) {
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
      <Paper className={classes.root}>
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
    );

  }
}

export default withStyles(styles)(SearchBar);