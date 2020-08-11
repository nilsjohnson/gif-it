import React from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import ProgressBar from '../ProgressBar';

export default function Uploading(props) {
  const { fileName, fileSize, error, cancel } = props;

  return (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid item
          container
          direction="row"
          justify="space-evenly"
          alignItems="flex-start"
          spacing={2}
        >
          {/* holds the fileName and upload Progress */}
          <Grid item xs={12} md={6}>
            <Typography noWrap variant="h5">
              {fileName}
            </Typography>
            <Typography  variant={"subtitle2"} color="textSecondary" gutterBottom>
              {fileSize}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <ProgressBar value={props.percentUploaded} />
          </Grid>
        </Grid>

        {/* For messages, errors, etc */}
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={1}
        >
          <Grid item>
            {(error ? error : 'Please Wait...')}
          </Grid>

          {props.error ?
            <Grid item>
              <Button variant="contained" color="secondary" onClick={cancel}>Close</Button>
            </Grid> : ''}
        </Grid>
      </Grid>
  );
}