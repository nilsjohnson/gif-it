import React from 'react';
import './style.css';
import PropTypes from 'prop-types';


const IndvidualWell = (props) => (
    <div>
        <p>File: {props.fileName}</p>
        <p>Size: {props.size}</p>
        <p>Uploaded: {props.percentUploaded}%</p>
        <button>Convert</button>
	</div>
);

IndvidualWell.propTypes = {
    name: PropTypes.string,
    size: PropTypes.string,
    percentUploaded: PropTypes.number
  };
  


export default IndvidualWell;