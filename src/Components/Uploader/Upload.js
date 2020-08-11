import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { formatBytes } from '../../util/util';
import { Card } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Uploading from './Uploading';
import SettingOptions from './SettingOptions';
import Complete from './Complete';
import Converting from './Converting';
import GifBox from '../GifBox';

const useStyles = theme => ({
  root: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
  },
  btn: {
    margin: theme.spacing(2)
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    paddingBottom: theme.spacing(1)
  },
  uploadError: {
    border: '2px solid ' + theme.palette.error.light
  }
});


/**
 * Each Upload gets its own Component
 */
class Upload extends Component {
  constructor(props) {
    super(props)

    this.state = ({
      tags: [],
      description: '',
      size: 'md',
      message: ''
    });
  }

  setSize = (event) => {
    this.setState({ size: event.target.value });
  }

  addTag = (tag) => {
    this.setState({
      tags: [...this.state.tags, tag],
      message: ''
    });
  }

  removeTag = (tag) => {
    let tmp = this.state.tags;
    console.log(tmp);
    let index = tmp.findIndex(elem => elem === tag);
    tmp.splice(index, 1);
    this.setState({ tags: tmp });
  }

  setDescription = (description) => {
    this.setState({
      description: description
    });
  }

  convert = () => {
    let id = this.props.uploadId;
    // TODO reflect this change upstream
    this.props.convert(id, this.state.size);
  }

  cancel = () => {
    this.props.removeUpload(this.props.uploadId);
  }

  share = () => {
    let noErrors = true;
    const { uploadId } = this.props;
    const { tags, description } = this.state;

    if(description === null) {
      console.log('Description is null. A valid description must be entered.');
      noErrors = false;
    }
    if(tags.length === 0) {
      console.log('Tags array is empty. There must be at least 1 valid tag.');
      this.setState({message: 'Please enter a tag.'});
      noErrors = false;
    }

    if(noErrors) {
      this.props.share(uploadId, tags, description);
    }
    else {
      console.log('User input errors were present. No attempt to share made.');
    }
  }

  requestTagSuggestions = (curInput) => {
    const { requestTagSuggestions, uploadId } = this.props;
    requestTagSuggestions(uploadId, curInput);
  }

  getElement = () => {
    const { 
      conversionData = {}, 
      classes, 
      status, 
      error,
      fileName,
      size,
      percentUploaded,
      servePath, 
      suggestions } = this.props

    switch (status) {
      case 'uploading':
        return (
          <Uploading
            classes={classes}
            fileName={fileName}
            fileSize={formatBytes(size)}
            percentUploaded={percentUploaded}
            error={error}
            cancel={this.cancel}
          />);

      case 'settingOptions':
        return (
          <SettingOptions
            classes={classes}
            fileName={fileName}
            cancel={this.cancel}
            convert={this.convert}
            size={this.state.size}
            setSize={this.setSize}
          />
        );

      case 'converting':
        return (
          <Converting
            classes={classes}
            fileName={fileName}
            speed={conversionData.curSpeed}
            error={error}
            progress={conversionData.progress}
            cancel={this.cancel}
          />
        );

      case 'complete':
        return (
          <Complete
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
            message={this.state.message}
            classes={classes}
          />
        );

      default:
        // This ensures that render alaways returns something
        return (
          <p>Please Wait...</p>
        );
    }
  }

  render() {
    const { classes, error, status, uploadId } = this.props;

    if(status === 'shared') {
      // since GifBox is already wrapped in a Card, we can just render it.
      return (
        <GifBox gifId={uploadId} />
      );
    }

    return (
      <Card className={`${classes.root} ${error ? classes.uploadError : ''}`}>
        {this.getElement()}
      </Card>
    );


  }
}

Upload.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number,
  percentUploaded: PropTypes.number
};



export default withStyles(useStyles)(Upload);