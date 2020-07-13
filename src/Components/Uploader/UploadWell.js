import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import UploadProgressBox from '../UploadProgressBox';
import ConversionProgressBox from '../ConversionProgressBox';
import GifBox from '../GifBox';
import { TagBox } from '../TagBox';
import { Card, Grid } from '@material-ui/core';
import { formatBytes } from '../../util/util';
import GifOptionsBox from '../GifOptionsBox';


import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
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

  cancelUpload = () => {
    alert("Cancel Functionality Not Yet Implemented.");
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
      status
    } = this.props;

    const { curSpeed, progress } = conversionData;

    if(status === "uploading") {
      return (
        <UploadProgressBox 
          fileName={ fileName }
          fileSize={ formatBytes(size) }
          percentUploaded={ percentUploaded }
        /> );
    }
    else if (status === "settingOptions") {
        return (
          <GifOptionsBox 
            fileName={ fileName }
            convert={this.convert}
          />

        );
    }
    else if (status === "converting") {
      return (
        <ConversionProgressBox
          fileName={ fileName }
          speed={ curSpeed }
          progress={ progress }
          convert={ this.convert }
        />
      );
    }
    else if (status === "complete") {
      return (
        <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
          <GifBox
            servePath={ servePath }
          />
          <TagBox 
            setTags={ this.setTags }
            share={ this.share }
          />
        </Grid>
        
      );
    }
  }


  render() {
    const { classes } = this.props;

    return(
      <Card className={classes.root}>
        {this.getElement()}
      </Card>
    );
  }
}

UploadWell.propTypes = {
  name: PropTypes.string,
  size: PropTypes.string,
  percentUploaded: PropTypes.number
};



export default withStyles(useStyles)(UploadWell);