import React from "react";
import PropTypes from "prop-types";
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  responsive: {
    width: '100%'
  }
});

export default function Complete(props) {
  const { fileName } = props;
  const classes = useStyles();

  return (
    <Grid
      container item
      direction="row"
      justify="center"
      alignItems="center"
    >
      <Grid item>
          <img className={classes.responsive} src={fileName} alt={fileName} />
      </Grid>
    </Grid>
  );
}

Complete.propTypes = {
  fileName: PropTypes.string,
}