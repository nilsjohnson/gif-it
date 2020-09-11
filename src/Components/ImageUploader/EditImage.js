import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { DropBox } from "../DropBox";
import { Typography, Paper, Grid, Box } from "@material-ui/core";
import UploaderBase from "../UploaderBase/Index";
import Upload from "../GifUploader/Upload";
import { withStyles } from '@material-ui/core/styles';

const INPUT_ID = "img-uploader-input";

const useStyles = theme => ({
    hidden: {
        display: "none"
    },
    fullWidth: {
        width: '100%'
    }
});

class EditImage extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentDidMount = () => {

    }

    componentDidUpdate = () => {
        const { upload } = this.props;

        let inputElem = document.getElementById("cavas-in-" + upload.uploadId);
        inputElem.onload = () => {
            let outputElem = document.getElementById("cavas-out-" + upload.uploadId);
            let mat = cv.imread(inputElem);
            cv.imshow(outputElem, mat);
        }
        inputElem.src = URL.createObjectURL(upload.file);


    }

    render() {
        const { classes, upload = {} } = this.props;

        return (
            <Box>
                <canvas className={classes.fullWidth} id={"cavas-out-" + upload.uploadId} ></canvas>
                <img className={classes.hidden} id={"cavas-in-" + upload.uploadId} ></img>
            </Box>

        );
    }
}

export default withStyles(useStyles)(EditImage);