import React from 'react';
import { Card, Grid, Button, Typography } from '@material-ui/core';
import ProgressBar from '../ProgressBar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    padding: "8px"
  },
  title: {
    fontSize: 14,
  },
  center: {
    textAlign: 'center'
  }
});

export default function UploadProgresBox(props) {
  const classes = useStyles();

  return (
    <Grid
      item
      container
      direction="row"
      justify="space-evenly"
      alignItems="flex-start"
      className={classes.root}
    >
      <Grid item
        container
        direction="row"
        justify="space-evenly"
        alignItems="flex-start"
        spacing={2}
      >
        <Grid item xs={12} sm={6}>
          <Typography variant="h5" component="h2">
            {props.fileName}
          </Typography>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            {props.fileSize}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <ProgressBar value={props.percentUploaded} />
        </Grid>
      </Grid>

      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={1}
      >
        <Grid item>
          {(props.error ? props.error : "Please Wait...")}
        </Grid>
        
          {props.error ? 
          <Grid item>
            <Button variant="contained" color="secondary" onClick={props.cancel}>Close</Button>
          </Grid> : ""}
        
      </Grid>


    </Grid>
  );
}