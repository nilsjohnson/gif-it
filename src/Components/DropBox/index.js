import React from "react";
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  dropBox: {
    margin: theme.spacing(1),
    border: `4px dashed ${theme.palette.secondary.light}`,
    width: '100%',
    height: '300px',
    backgroundColor: theme.palette.primary.light
  },
  chooseFiles: {
    opacity: .5,
  }
}));

export function DropBox(props) {
  const classes = useStyles();
  const {id, onDrop, onDragOver, onDragLeave, hovering, selectFilesUpload, uploadInstructionsText, mimeTypes, error } = props;

  return (
      <Grid container item
        direction="column"
        justify="center"
        alignItems="center"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={hovering ? `${classes.chooseFiles} ${classes.dropBox}` : classes.dropBox}
      >
          <p>{uploadInstructionsText}</p>
          <input className={classes.fileInput} id={id} type="file" accept={mimeTypes} multiple onChange={selectFilesUpload} />
          <p>{error ? error : ""}</p>
      </Grid>

  );
}

DropBox.propTypes = {
  selectFilesUpload: PropTypes.func,
  onDrop: PropTypes.func,
  onDragLeave: PropTypes.func,
  onHovering: PropTypes.func,
  onDragOver: PropTypes.func,
  uploadInstructionsText: PropTypes.string,
  id: PropTypes.string
};
