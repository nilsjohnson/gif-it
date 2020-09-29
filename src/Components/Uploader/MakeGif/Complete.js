import React from "react";
import PropTypes from "prop-types";
import TagInputBox from '../../TagInputBox';
import { Grid } from '@material-ui/core';
import EnterDescription from '../EnterDescription';

export default function Complete(props) {
  const {
    classes,
    fileName,
    share,
    removeTag,
    tags, 
    addTag, 
    setDescription,  
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
        <img className={classes.image} src={fileName} alt={fileName} />
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
    </Grid>
  );
}

Complete.propTypes = {
  tags: PropTypes.array,
  addTag: PropTypes.func,
  removeTag: PropTypes.func,
  setDescription: PropTypes.func,
  fileName: PropTypes.string,
  requestTagSuggestions: PropTypes.func,
  suggestions: PropTypes.array,
  inputError: PropTypes.string
}