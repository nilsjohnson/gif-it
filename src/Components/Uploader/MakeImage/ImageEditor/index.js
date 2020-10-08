import React, { Component } from 'react';
import { Grid, IconButton, Box, Typography, CircularProgress } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import { gaussianBlur, grayscale, makeThumbnail, doInitialLoad, original } from '../../cvUtil';

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
        const { upload, setMakeImages } = this.props;

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
                heightInputErr: false
            }
        };

        this.srcElement = React.createRef();
        this.outputThumbElement = React.createRef();
        this.outputWebElement = React.createRef();
        this.outputFullSizeElement = React.createRef();
        this.renderImage = this.original;
        setMakeImages(upload.uploadId, this.makeImages);
    }

    doInitialLoad = () => {
        console.log("initial loading.");
        console.log(this.srcElement.current);
        console.log(this.outputWebElement.current);

        doInitialLoad(this.srcElement.current, this.outputWebElement.current, (width, height) => {
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
        });
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

    grayscale = (src = this.srcElement.current, dst = this.outputWebElement.current, dimensions = null ) => {
        grayscale(src, dst, dimensions);
        this.renderImage = this.grayscale;
    }

    gaussianBlur = (src = this.srcElement.current, dst = this.outputWebElement.current, dimensions = null ) => {
        gaussianBlur(src, dst, dimensions);
        this.renderImage = this.gaussianBlur;
    }

    original = (src = this.srcElement.current, dst = this.outputWebElement.current, dimensions = null ) => {
        original(src, dst, dimensions);
        this.renderImage = this.original;
    }

    doMakeThumbnail = async () => {
        return new Promise((resolve, reject) => {
            makeThumbnail(this.outputWebElement.current, this.outputThumbElement.current, (blob) => {
                resolve(blob);
            });
        });
    }

    doMakeWebImage = async () => {
        return new Promise((resolve, reject) => {
            this.outputWebElement.current.toBlob(blob => {
                resolve(blob);
            }, 'image/jpeg', .95);
        });
    }

    doMakeFullSize = async () => {
        const { dimensions = {} } = this.state;
        const { width, height } = dimensions;

        let dims = { width: width, height: height };

        return new Promise((resolve, reject) => {
            this.renderImage(this.srcElement.current, this.outputFullSizeElement.current, dims);
            this.outputFullSizeElement.toBlob(blob => {
                resolve(blob);
            }, 'img/jpeg', .95);
        });
    }

    makeImages = async () => {
        console.log('make images called');
        const { upload = {} } = this.props;

        let thumbnail = await this.doMakeThumbnail();
        let websize = await this.doMakeWebImage();
        let fullsize = await this.doMakeWebImage();
        websize.name = upload.file.name;
        upload.update(upload.uploadId, {
            file: websize,
            thumbFile: thumbnail,
            fullFile: fullsize
        });
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

                        <Box>
                            {/* This element is the original source */}
                            <img 
                                ref={this.srcElement} 
                                className={classes.hidden} 
                                src={this.state.originalImage}
                                onLoad={this.doInitialLoad}
                            />
                            
                            {/* this is the the thumbnail */}
                            <canvas ref={this.outputThumbElement} 
                                className={classes.hidden}
                            />
                            
                            {/* this is the web version version */}
                            <canvas
                                ref={this.outputWebElement}
                                className={classes.fullWidth}
                                id={"out-" + upload.uploadId} >
                            </canvas>
                            
                            {/* This is the fullsize version */}
                            <canvas
                                ref={this.outputFullSizeElement}
                                className={`${classes.hidden}`}>
                            </canvas>

                        </Box>


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