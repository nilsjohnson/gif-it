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
    backgroundColor: theme.palette.primary.light
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
      tags: ""
    });

  }

  setTags = (event) => {
    this.setState({
      tags: event.target.value
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
    this.props.share(this.props.uploadId, this.props.servePath, this.state.tags);
    alert("Gif Added To Gallery! Thanks!");
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