import React from 'react';
import { Button, Card, CardActions, Grid, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
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

export default function GifOptionsBox(props) {
  const classes = useStyles();

  return (
    <div>
      <CardContent>
        <Grid spacing={3} container>
          <Grid item xs={12} sm={6}>
            <Typography variant="h5" component="h2">
              {props.fileName}
            </Typography>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              {props.fileSize}
            </Typography>
          </Grid>
        </Grid>
        <Grid container
          direction="row"
          justify="center"
          alignItems="center">
          <Typography>
          // TODO, add some options here
          </Typography>
        </Grid>
      </CardContent>
      <CardActions>
        <Button onClick={props.convert}>Convert To Gif</Button>
      </CardActions>
    </div>
  );
}