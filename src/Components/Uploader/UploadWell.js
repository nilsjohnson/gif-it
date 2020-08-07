import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import UploadProgressBox from '../UploadProgressBox';
import ConversionProgressBox from '../ConversionProgressBox';
import TagBox  from '../TagBox';
import { Grid, Typography, Button, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup, Card } from '@material-ui/core';
import { formatBytes } from '../../util/util';

import { withStyles } from '@material-ui/core/styles';
import GifBox from '../GifBox';

const useStyles = theme => ({
  root: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
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
      tags: [],
      description: "",
      quality: 'md'
    });

  }

  setConversionQuality = (event) => {
    this.setState({ quality: event.target.value });
  }

  addTag = (tag) => {
    this.setState({
      tags: [...this.state.tags, tag]
    });
  }

  removeTag = (tag) => {
    let tmp = this.state.tags;
    console.log(tmp);
    let index = tmp.findIndex(elem => elem === tag);
    tmp.splice(index, 1);
    this.setState({ tags: tmp});
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

  // TODO delete this..
  triggerDownload = () => {
    alert("download not yet implemented");
  }

  requestTagSuggestions = (curInput) => {
    const { requestTagSuggestions, uploadId } = this.props;
    requestTagSuggestions(uploadId, curInput);
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
      suggestions
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
                    <FormControlLabel checked={this.state.quality === 'sm' ? true : false} value="sm" control={<Radio />} label="Small (500 pixels wide)" />
                    <FormControlLabel checked={this.state.quality === 'md' ? true : false} value="md" control={<Radio />} label="Medium (750 pixels wide)" />
                    <FormControlLabel checked={this.state.quality === 'lg' ? true : false} value="lg" control={<Radio />} label="Large (1000 pixels wide)" />
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
            <Button className={classes.btn} onClick={this.cancel} variant="contained" color="secondary">Cancel</Button>
            <Button className={classes.btn} onClick={this.convert} variant="contained" color="primary">Convert</Button>
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
              tags={this.state.tags}
              addTag={this.addTag}
              removeTag={this.removeTag}
              setDescription={this.setDescription}
              download={this.triggerDownload}
              servePath={servePath}
              requestTagSuggestions={this.requestTagSuggestions}
              suggestions={suggestions}
              error={error}
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
        <Card raised className={`${classes.root} ${error ? classes.error : ""}` }>
          {this.getElement()}
        </Card>
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