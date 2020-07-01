import React from 'react';
import './style.css';
import { formatBytes } from '../../util/util';


function UploadProgressBox(props) {
    return (
        <div>
          <p>File: {props.fileName}</p>
          <p>Size: {formatBytes(props.size)}</p>
          <p>Uploaded: {props.percentUploaded}%</p>
          <p>{props.message}</p>
        </div>
    );
}

export default UploadProgressBox;