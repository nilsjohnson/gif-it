import React, { Component } from 'react';
import ProgressBar from '../../ProgressBar';
import { Grid, Button, Card } from "@material-ui/core";

export default function FileBar(props) {
    const { upload = {} } = props;

    const callRemoveUpload = () => {
        props.removeUpload(upload.uploadId);
    }

    if(upload.status === 'uploading') {
        return (
            <ProgressBar value={upload.percentUploaded}/>
        );
    }
    else {
        return (
            <Button
                onClick={callRemoveUpload}
            >
                Cancel
            </Button>
        );
    }
  }