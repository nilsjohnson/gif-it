import React from 'react';
import './style.css';
import PropTypes from 'prop-types';


const IndvidualWell = (props) => (
    <div>
        <h3>{props.fileName}</h3>
        <p>{props.size}</p>
        <button>Convert</button>
	</div>
);

IndvidualWell.propTypes = {
    name: PropTypes.string,
    size: PropTypes.object
  };
  


export default IndvidualWell;