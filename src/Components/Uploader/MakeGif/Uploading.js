import React from 'react';
import { Grid } from '@material-ui/core';

export default function Uploading(props) {
  const { error } = props;

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
        </Grid>
      </Grid>
    </Grid>
  );
}