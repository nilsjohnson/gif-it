import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import UploadProgressBox from '../UploadProgressBox';
import ConversionProgressBox from '../ConversionProgressBox';
import GifBox from '../GifBox';
import { TagBox } from '../TagBox';
import { withStyles } from '@material-ui/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { formatBytes } from '../../util/util';
import { Grid, Box } from '@material-ui/core';
import ProgressBar from '../ProgressBar/index.js';

const styles = (theme) => ({
  root: {
    width: '100%',
    margin: "8px"
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
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
    let id = this.props.fileId;
    this.props.convert(id)
  }

  cancelUpload = () => {
    alert("Cancel Functionality Not Yet Implemented.");
  }

  share = () => {
    this.props.share(this.props.fileId, this.props.servePath, this.state.tags);
    alert("Gif Added To Gallery! Thanks!");
  }

  getConversionProgressBox = () => {
    return (
      <ConversionProgressBox
        fileName={this.props.fileName}
        size={this.props.size}
        conversionStatus={this.props.conversionStatus}
        videoLength={this.props.videoLength}
        convert={this.convert} />
    );
  }

  getUploadProgressBox = () => {
    return (<UploadProgressBox
      fileName={this.props.fileName}
      size={this.props.size}
      percentUploaded={this.props.percentUploaded}
      convert={this.convert}
      cancelUpload={this.cancelUpload}
      message={this.props.error ? this.props.error : "Please Wait...."} />
    );
  }

  getGifBox = () => {
    if(this.props.servePath) {
      return (
        <div>
          <GifBox
            servePath={this.props.servePath}
            share={this.share}
            setTags={this.setTags}
          />
          <TagBox
            setTags={this.setTags}
            share={this.share}
          />
        </div>
      );
    }

    return "";
  }

  getView = () => {
    if (this.props.servePath) {
      return this.getGifBox();
    }
    else if (this.props.uploadComplete) {
      return this.getConversionProgressBox();
    }
    else {
      return this.getUploadProgressBox();
    }

  }

  render() {
    const { classes } = this.props;

    return (
      <Card className={classes.root}>
        <CardContent>
          <Grid spacing={3} container>
            <Grid item xs={6}>
              <Typography variant="h5" component="h2">
                {this.props.fileName}
              </Typography>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                {formatBytes(this.props.size)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <ProgressBar value={this.props.percentUploaded} />
            </Grid>
          </Grid>

          {
            this.props.servePath ? this.getGifBox() : 
            <ConversionProgressBox
            conversionStatus={this.props.conversionStatus}
            videoLength={this.props.videoLength}
            convert={this.convert} 
            enableBtn={this.props.uploadComplete}

          />
          }
            
        </CardContent>
      </Card>
    )

  }
}

UploadWell.propTypes = {
  name: PropTypes.string,
  size: PropTypes.string,
  percentUploaded: PropTypes.number
};



export default withStyles(styles)(UploadWell);

