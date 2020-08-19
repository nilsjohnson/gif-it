import React from "react";
import PropTypes from "prop-types";
import TagInputBox from '../TagInputBox';
import { Grid, Button } from '@material-ui/core';
import EnterDescription from './EnterDescription';

function Complete(props) {
  const {
    classes,
    fileName,
    share,
    cancel,
    removeTag,
    tags, 
    addTag, 
    setDescription, 
    servePath, 
    requestTagSuggestions, 
    suggestions, 
    message } = props;



  return (
    <Grid
      container item
      direction="row"
      justify="center"
      alignItems="center"
    >
      <Grid item>
        <img className={classes.image} src={servePath} alt={fileName} />
      </Grid>
      <Grid item xs={12}>
        <EnterDescription
          setDescription={setDescription}
        />
        <TagInputBox
          share={share}
          tags={tags}
          addTag={addTag}
          removeTag={removeTag}
          requestTagSuggestions={requestTagSuggestions}
          suggestions={suggestions}
        />
      </Grid>
      <Grid item>
        {message ? message : ''}
      </Grid>
      <Grid item container
        direction="row"
        justify="center"
        alignItems="flex-start" >
        <Button className={classes.btn} variant="contained" color="secondary" onClick={cancel} > Cancel </Button>
        <Button className={classes.btn} variant="contained" color="primary" onClick={share} > Share! </Button>
      </Grid>
    </Grid>
  );
}

Complete.propTypes = {
  share: PropTypes.func,
  cancel: PropTypes.func,
  tags: PropTypes.array,
  addTag: PropTypes.func,
  removeTag: PropTypes.func,
  setDescription: PropTypes.func,
  download: PropTypes.func,
  servePath: PropTypes.string,
  requestTagSuggestions: PropTypes.func,
  suggestions: PropTypes.array,
  inputError: PropTypes.string
}

export default Complete;