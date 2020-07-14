import React from 'react';
import { Card, Grid, CardContent, Typography } from '@material-ui/core';
import ProgressBar from '../ProgressBar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles ({
  root: {
    width: '100%',
    margin: "8px"
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
    >
      <Grid item
        container
        direction="row"
        justify="space-evenly"
        alignItems="flex-start"
      >
        <Grid item xs={12} sm={6}>
          <Typography variant="h5" component="h2">
            {props.fileName}
          </Typography>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            {props.fileSize}
          </Typography>
        </Grid>
        <Grid xs={12} sm={6}>
          <ProgressBar value={props.percentUploaded} />
        </Grid>
          
        
      </Grid>

      <Typography>
        Please Wait...
            </Typography>
    </Grid>
  );
}