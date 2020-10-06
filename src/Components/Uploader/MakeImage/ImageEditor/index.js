import React, { Component } from 'react';
import { Grid, IconButton, Box, Typography, CircularProgress } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import { biLateralFilter, gaussianBlur, grayscale, showImage, doInitialLoad, scaleMat } from '../../cvUtil';

import ToolBar from './ToolBar';


const useStyles = theme => ({
    hidden: {
        display: "none"
    },
    fullWidth: {
        width: '100%'
    },
    editorContainer: {
        backgroundColor: theme.palette.success.light,
    },
    uploading: {
        opacity: .5
    },
    centered: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    }
});

class ImageEditor extends Component {
    constructor(props) {
        super(props);

        const { upload } = this.props;

        this.state = {
            originalImage: URL.createObjectURL(upload.file),
            dimensions: {
                width: 0,
                height: 0,
                enteredWidth: 0,
                enteredHeight: 0,
                widthRatio: 0,
                heightRatio: 0,
                widthInputErr: false,
                heightInputErr: false },
            transforming: false

            
        };

        this.srcElement = null;
        this.thumbElement = null;
        this.outputElement = null;
        this.renderImage = this.original;

    }

    componentDidMount = () => {
        const { upload } = this.props;
        this.srcElement = document.getElementById("input-" + upload.uploadId);
        this.thumbElement = document.getElementById("thumb-" + upload.uploadId);
        this.outputElement = document.getElementById("out-" + upload.uploadId);

        this.srcElement.onload = () => {
            // display the image, and get it's height and width
            doInitialLoad(this.srcElement, this.outputElement, (width, height) => {
                let dimensions = {
                    width: width,
                    height: height,
                    enteredWidth: width,
                    enteredHeight: height,
                    widthRatio: height / width,
                    heightRatio: width / height
                }
                this.setState({
                    dimensions: dimensions
                });

                this.makeImages();
            });
        }
    }

    setNewSize = (newDimensions) => {
        console.log("new: ");
        console.log(newDimensions);
        console.log("old");
        console.log(this.state.dimensions);

        let callback = null;
        // if the text input blurred, the width and height have been updated, 
        // so we need to draw the image again
        if (newDimensions.height !== this.state.dimensions.height
            || newDimensions.width !== this.state.dimensions.width) {
            callback = this.renderImage;
        }

        this.setState({
            dimensions: newDimensions
        }, callback);
    }

    grayscale = () => {
        console.log("grayscale");
        console.log(this.state);
        grayscale(
            this.srcElement,
            this.outputElement,
            this.state.dimensions.width,
            this.state.dimensions.height
        );

        this.makeImages();
        this.renderImage = this.grayscale;
    }

    gaussianBlur = () => {
        console.log("do gaussian blur");
        gaussianBlur(
            this.srcElement,
            this.outputElement,
            this.state.dimensions.width,
            this.state.dimensions.height
        );

        this.makeImages();
        this.renderImage = gaussianBlur;
    }

    original = () => {
        console.log("original");
        showImage(
            this.srcElement,
            this.outputElement,
            this.state.dimensions.width,
            this.state.dimensions.height
        );

        this.makeImages();
        this.renderImage = this.original;
    }

    makeImages = () => {
        scaleMat(this.outputElement, this.thumbElement, 300, (blob) => {
            this.props.onThumbnailMade(this.props.upload.uploadId, blob);
        });

        this.outputElement.toBlob(blob => {
            blob.name = this.props.upload.file.name;
            this.props.onImageMade(this.props.upload.uploadId, blob);
        }, 'image/jpeg', .95);
    }


    crop = () => {

    }

    render() {
        const { classes, upload } = this.props;
        return (
            <Grid
                container item
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Grid item xs={1}></Grid>
                <Grid item xs={10} >
                    <Grid
                        container item
                        direction="column"
                        justify="center"
                        alignItems="center"
                    >
                        
                        <div>
                            {/* This element is the original source */}
                            <img className={classes.hidden} id={"input-" + upload.uploadId} src={this.state.originalImage}></img>
                            {/* this is the the thumbnail */}
                            <canvas className={classes.hidden} id={"thumb-" + upload.uploadId} />
                            {/* this is the edited version */}
                            <canvas
                                className={`${classes.fullWidth} ${upload.status === "uploading" || upload.status === "complete"? classes.uploading : ""}`}
                                id={"out-" + upload.uploadId} >

                            </canvas>
                        </div>


                        <ToolBar
                            grayscale={this.grayscale}
                            gaussianBlur={this.gaussianBlur}
                            original={this.original}
                            setNewSize={this.setNewSize}
                            dimensions={this.state.dimensions}
                        />

                    </Grid>
                </Grid>
                <Grid item xs={1}></Grid>
            </Grid>

        );
    }
}

export default withStyles(useStyles)(ImageEditor);