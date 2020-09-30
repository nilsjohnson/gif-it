import React from "react";
import PropTypes from "prop-types";
import { Grid } from '@material-ui/core';

export default function Complete(props) {
  const {
    fileName,
  } = props;

  return (
    <Grid
      container item
      direction="row"
      justify="center"
      alignItems="center"
    >
      <Grid item>
        <img src={fileName} alt={fileName} />
      </Grid>
    </Grid>
  );
}

Complete.propTypes = {
  fileName: PropTypes.string,
}