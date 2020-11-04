import React, { Component } from 'react';
import { Grid, Typography, Button, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import PropTypes from 'prop-types';

class SettingOptions extends Component {
  // constructor(props) {
  //   super(props);


  // }

  render() {
  
    const { convert, size, setSize, } = this.props;

    return (
      <Grid
        container item
        direction="column"
        justify="flex-start"
        alignItems="flex-start"
        spacing={1}
      >
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Typography noWrap variant="h5">
            Select Gif Options
          </Typography>
        </Grid>

        <Grid
          container item xs={12}
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          spacing={1}
        >
          <Grid item md={1}></Grid>
          <Grid item xs={12} sm={10}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Output Size:</FormLabel>
              <RadioGroup aria-label="Size" name="size" onChange={setSize}>
                <FormControlLabel checked={size === 'sm' ? true : false} value="sm" control={<Radio />} label="Small (500 pixels wide)" />
                <FormControlLabel checked={size === 'md' ? true : false} value="md" control={<Radio />} label="Medium (750 pixels wide)" />
                <FormControlLabel checked={size === 'lg' ? true : false} value="lg" control={<Radio />} label="Large (1000 pixels wide)" />
              </RadioGroup>
            </FormControl>
          </Grid>
          {/* Add New Items Here, when the time comes. */}
          <Grid item md={1}></Grid>
        </Grid>
        {/* for the buttons */}
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Button onClick={convert} variant="contained" color="primary">Convert</Button>
        </Grid>
      </Grid>
    );
  }
}

SettingOptions.propTypes = {
  fileName: PropTypes.string,
  cancel: PropTypes.func,
  convert: PropTypes.func,
  size: PropTypes.string,
  setSize: PropTypes.func
};


export default SettingOptions;
