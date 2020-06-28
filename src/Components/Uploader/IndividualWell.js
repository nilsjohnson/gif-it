import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

class IndvidualWell extends Component {
  // constructor(props) {
  //   super(props)
  // }

  cancel = (event) => {
    alert("Hi :)");
  }

  convert = () => {
    let id = this.props.fileId;
    this.props.convert(id)
  }

  render() {
    return (
      <div className='upload-box'>
        <p>File: {this.props.fileName}</p>
        <p>Size: {formatBytes(this.props.size)}</p>
        <p>Uploaded: {this.props.percentUploaded}%</p>
        <div className="container">
          <p>{this.props.conversionStatus}</p>
        </div>
        <div className="container">
          <button onClick={this.convert}>Convert</button> <button onClick={this.cancel}>Cancel</button>
        </div>
        <div className="container">
          <img alt="" className="upload-result" src={this.props.servePath}/>
        </div>
	  </div> );
  }
}
  
IndvidualWell.propTypes = {
    name: PropTypes.string,
    size: PropTypes.string,
    percentUploaded: PropTypes.number
  };
  


export default IndvidualWell;