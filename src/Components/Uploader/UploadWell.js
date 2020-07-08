import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import UploadProgressBox from '../UploadProgressBox';
import ConversionProgressBox from '../ConversionProgressBox';
import GifBox from '../GifBox';
import { TagBox } from '../TagBox';
import { Card } from '@material-ui/core';
import { sizing } from '@material-ui/system';

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
  }

  getConversionProgressBox = () => {
    return (
      <ConversionProgressBox
              fileName={this.props.fileName}
              size={this.props.size}
              conversionStatus={this.props.conversionStatus}
              videoLength={this.props.videoLength}
              convert = {this.convert}/>
    );
  }

  getUploadProgressBox = () => {
    return (<UploadProgressBox
              fileName={this.props.fileName}
              size={this.props.size}
              percentUploaded={this.props.percentUploaded}
              convert={this.convert}
              cancelUpload={this.cancelUpload}
              message={this.props.error ? this.props.error : "Please Wait...."}/>
    );
  }

  getGifBox = () => {
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

  getView = () => {
    if(this.props.servePath) {
      return this.getGifBox();
    }
    else if(this.props.uploadComplete) {
      return this.getConversionProgressBox();
    }
    else {
      return this.getUploadProgressBox();
    }

  }

  render() {
    let content = this.getView();
    return (
      <Card width={'50%'}>
        {content}
      </Card>
    )

  }
}
  
UploadWell.propTypes = {
    name: PropTypes.string,
    size: PropTypes.string,
    percentUploaded: PropTypes.number
  };
  


export default UploadWell;

