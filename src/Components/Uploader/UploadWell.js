import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import UploadProgressBox from '../UploadProgressBox';
import ConversionProgressBox from '../ConversionProgressBox';
import { TagBox } from '../TagBox';
import { Box, Grid } from '@material-ui/core';
import { formatBytes } from '../../util/util';
import GifOptionsBox from '../GifOptionsBox';


import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
  root: {
    width: '100%',
    margin: "8px",
    backgroundColor: theme.palette.primary.dark
  },
  title: {
    fontSize: 14,
  },
  center: {
    textAlign: 'center'
  },
  image: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
    padding: theme.spacing(1)
  }
});



class UploadWell extends Component {
  constructor(props) {
    super(props)

    this.state = ({
      tags: "",
      description: ""
    });

  }

  setTags = (event) => {
    console.log(`tags: ${event.target.value.trim()}`);
    this.setState({
      tags: event.target.value.trim()
    });
  }

  setDescription = (event) => {
    console.log(`description: ${event.target.value.trim()}`);
    this.setState({
      description: event.target.value.trim()
    });
  }


  convert = () => {
    let id = this.props.uploadId;
    this.props.convert(id)
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
      classes
    } = this.props;

    const { curSpeed, progress } = conversionData;

    if (status === "uploading") {
      return (
        <UploadProgressBox
          fileName={fileName}
          fileSize={formatBytes(size)}
          percentUploaded={percentUploaded}
        />);
    }
    else if (status === "settingOptions") {
      return (
        <GifOptionsBox
          fileName={fileName}
          convert={this.convert}
        />

      );
    }
    else if (status === "converting") {
      return (
        <ConversionProgressBox
          fileName={fileName}
          speed={curSpeed}
          progress={progress}
          convert={this.convert}
        />
      );
    }
    else if (status === "complete") {
      return (
        <Grid
          container item
          direction="row"
          justify="space-evenly"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12} sm={6}>
            <img className={classes.image} src={servePath} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TagBox 
              convert={this.convert}
              share={this.share}
              cancel={this.cancel}
              setTags={this.setTags}
              setDescription={this.setDescription}
              download={this.triggerDownload}
            />
          </Grid>
        </Grid>
      );
    }
  }

  render() {
    const {classes} = this.props;

    return (
      <Box className={classes.root}>
        {this.getElement()}
      </Box>
    );
  }
}

UploadWell.propTypes = {
  name: PropTypes.string,
  size: PropTypes.string,
  percentUploaded: PropTypes.number
};



export default withStyles(useStyles)(UploadWell);