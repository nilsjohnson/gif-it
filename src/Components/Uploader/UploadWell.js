import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import UploadProgressBox from '../UploadProgressBox';
import ConversionProgressBox from '../ConversionProgressBox';
import { TagBox } from '../TagBox';
import { Box, Grid, Typography, Button, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { formatBytes } from '../../util/util';

import { withStyles } from '@material-ui/core/styles';
import GifBox from '../GifBox';

const useStyles = theme => ({
  root: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.dark,
    borderRadius: theme.spacing(2)
  },
  title: {
    fontSize: 14,
  },
  btn: {
    margin: theme.spacing(2)
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    paddingBottom: theme.spacing(1)
  },
  error: {
    border: '2px solid ' + theme.palette.error.main
  }
});



class UploadWell extends Component {
  constructor(props) {
    super(props)

    this.state = ({
      tags: "",
      description: "",
      quality: 'sm'
    });

  }

  setConversionQuality = (event) => {
    this.setState({ quality: event.target.value });
  }

  setTags = (event) => {
    this.setState({
      tags: event.target.value.trim()
    });
  }

  setDescription = (event) => {
    this.setState({
      description: event.target.value.trim()
    });
  }


  convert = () => {
    let id = this.props.uploadId;
    this.props.convert(id, this.state.quality);
  }

  cancel = () => {
    this.props.removeUpload(this.props.uploadId);
  }

  share = () => {
    const { uploadId } = this.props;
    const { tags, description } = this.state;
    this.props.share(uploadId, tags, description);
  }

  triggerDownload = () => {
    alert("download not yet implemented");
  }

  getElement = () => {

    const {
      conversionData = {},
      fileName,
      size,
      percentUploaded,
      servePath,
      status,
      classes,
      error,
      uploadId
    } = this.props;

    const { curSpeed, progress } = conversionData;

    if (status === "uploading") {
      return (
        <UploadProgressBox
          fileName={fileName}
          fileSize={formatBytes(size)}
          percentUploaded={percentUploaded}
          error={error}
          cancel={this.cancel}
        />);
    }
    else if (status === "settingOptions") {
      return (
        <Grid
          container item
          direction="column"
          justify="flex-start"
          alignItems="flex-start"
          spacing={1}
        >
          <Grid item xs={12}>
            <Typography variant="h5" component="h2">
              {fileName}
            </Typography>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              {formatBytes(size)}
            </Typography>
          </Grid>

          <Grid
            container item xs={12}
            direction="row"
            justify="space-around"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid item xs={1}></Grid>
              <Grid item xs={10} sm={5}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Output Size:</FormLabel>
                  <RadioGroup aria-label="Size" name="size" onChange={this.setConversionQuality}>
                    <FormControlLabel checked={this.state.quality === 'sm' ? true : false} value="sm" control={<Radio />} label="Small (256 pixels wide)" />
                    <FormControlLabel checked={this.state.quality === 'md' ? true : false} value="md" control={<Radio />} label="Medium (512 pixels wide)" />
                    <FormControlLabel checked={this.state.quality === 'lg' ? true : false} value="lg" control={<Radio />} label="Large (640 pixels wide)" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={10} sm={5}>
              {/* Nothing here yet */}
            </Grid>

          </Grid>

          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Button className={classes.btn} onClick={this.cancel} variant="contained" color="primary">Cancel</Button>
            <Button className={classes.btn} onClick={this.convert} variant="contained" color="secondary">Convert</Button>
          </Grid>
        </Grid>
      );
    }
    else if (status === "converting") {
      return (
        <ConversionProgressBox
          fileName={fileName}
          speed={curSpeed}
          progress={progress}
          convert={this.convert}
          error={error}
          cancel={this.cancel}
        />
      );
    }
    else if (status === "complete") {
      return (
        <Grid
          container item
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item>
            <img className={classes.image} src={servePath} alt={fileName} />
          </Grid>
          <Grid item xs={12}>
            <TagBox
              convert={this.convert}
              share={this.share}
              cancel={this.cancel}
              setTags={this.setTags}
              setDescription={this.setDescription}
              download={this.triggerDownload}
              servePath={servePath}
            />
          </Grid>
        </Grid>
      );
    }
  }

  render() {
    const { status, classes, error, uploadId } = this.props;

    if(status !== 'shared') {
      return (
        <Box className={`${classes.root} ${error ? classes.error : ""}`}>
          {this.getElement()}
        </Box>
      );
    }
    else {
      return (
        <GifBox gifId={uploadId}/>
      );
    }
   
  }
}

UploadWell.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number,
  percentUploaded: PropTypes.number
};



export default withStyles(useStyles)(UploadWell);