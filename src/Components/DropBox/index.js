import React from "react";
import { Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  dropBox: {
    marginTop: '1em',
    border: '4px dashed #19D192',
    borderTadius: '5px',
    width: '100%',
    height: '300px',
    backgroundColor: theme.palette.secondary.light
  },
  chooseFiles: {
    opacity: .5,
  }
}));

export function DropBox(props) {
  const classes = useStyles();
  return (
      <Grid container item
        direction="column"
        justify="center"
        alignItems="center"
        className={classes.chooseFiles}
        onDrop={props.onDrop}
        onDragOver={props.onDragOver}
        onDragLeave={props.onDragLeave}
        className={props.hovering ? `${classes.chooseFiles} ${classes.dropBox}` : classes.dropBox}
      >
          <p>Drag and Drop Video Files or</p>
          <input className={classes.fileInput} type="file" accept="video/*, image/*" multiple onChange={props.selectFilesUpload} />
      </Grid>

  );
}
