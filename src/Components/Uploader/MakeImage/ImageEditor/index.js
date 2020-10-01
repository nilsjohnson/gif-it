import React, { Component } from 'react';
import { Grid, IconButton, Box } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import { blackAndWhite, scaleMat } from '../../cvUtil';

import CropIcon from '@material-ui/icons/Crop';


const useStyles = theme => ({
    hidden: {
        display: "none"
    },
    fullWidth: {
        width: '100%'
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    editorContainer: {
        backgroundColor: theme.palette.success.light,
    },
    uploading: {
        opacity: .5
    }
});

class ImageEditor extends Component {
    constructor(props) {
        super(props);

        const { upload } = this.props;

        this.state = {
            originalImage: URL.createObjectURL(upload.file),
        };

        this.srcElement = null;
        this.thumbElement = null;
        this.outputElement = null;
    }

    componentDidMount = () => {
        const { upload } = this.props;
        this.srcElement = document.getElementById("input-" + upload.uploadId);
        this.thumbElement = document.getElementById("thumb-" + upload.uploadId);
        this.outputElement = document.getElementById("out-" + upload.uploadId);

        // make the thumbnail
        scaleMat(this.srcElement, this.thumbElement, 300, (blob) => {
            console.log("calling on thumb made");
            this.props.onThumbnailMade(upload.uploadId, blob);
        });

        // display the image
        scaleMat(this.srcElement, this.outputElement, 500, blb => {
            this.props.onThumbnailMade(upload.uploadId, blb);
        });

        this.outputElement.addEventListener('click', event => {
            console.log(event);
        });
    }

    renderBlackAndWhite = () => {
        console.log("blk and wht");
        blackAndWhite(this.srcElement, this.outputElement);
    }

    crop = () => {

    }

    render() {
        const { classes, upload } = this.props;

        return (
            <Grid
                container item
                direction="row"
                justify="flex-start"
                alignItems="flex-"
            >
                <Grid item xs={0} sm={1}></Grid>
                <Grid container item xs={1}
                    direction="column"
                    justify="center"
                    alignItems="center"
                    className={classes.editorContainer}
                >
                    <IconButton aria-label="crop" onClick={this.renderBlackAndWhite} >
                        <CropIcon />
                    </IconButton>
                    <IconButton aria-label="crop" onClick={this.crop} >
                        <CropIcon />
                    </IconButton>
                    <IconButton aria-label="crop" onClick={this.crop} >
                        <CropIcon />
                    </IconButton>
                    <IconButton aria-label="crop" onClick={this.crop} >
                        <CropIcon />
                    </IconButton>
                </Grid>

                <Grid xs={11} sm={9}>
                    <Grid
                        container item
                        direction="column"
                        justify="center"
                        alignItems="center"
                    >
                        {/* This element is the original source */}
                        <img className={classes.hidden} id={"input-" + upload.uploadId} src={this.state.originalImage}></img>
                        {/* this is the the thumbnail */}
                        <canvas className={classes.hidden} id={"thumb-" + upload.uploadId} />
                        {/* this is the edited version */}
                        <canvas
                            className={`${classes.fullWidth} ${upload.status === "uploading" ? classes.uploading : ""}`}
                            id={"out-" + upload.uploadId} >

                        </canvas>

                        <Grid item container
                            direction="row"
                            justify="center"
                            alignItems="center"
                            xs={12}
                            className={classes.editorContainer}
                        >
                            <IconButton aria-label="crop" onClick={this.crop} >
                                <CropIcon />
                            </IconButton>
                            <IconButton aria-label="crop" onClick={this.crop} >
                                <CropIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid xs={0} sm={1}></Grid>
            </Grid>

        );
    }
}

export default withStyles(useStyles)(ImageEditor);