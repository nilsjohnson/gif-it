import React from "react";
import { Typography, Container, Grid, Box, TextField, Button } from "@material-ui/core";
import UploaderBase from "../UploaderBase";
import { withStyles } from '@material-ui/core/styles';
import Upload from "./Upload";
import TagInputBox from '../TagInputBox';
import Test from "./Test";

const INPUT_ID = "img-uploader-input";



const useStyles = theme => ({
    root: {
        // width: '500px',
        // height: '250px'
    },
    container: {
        backgroundColor: theme.palette.primary.light,
        padding: theme.spacing(2),
        border: `4px dashed ${theme.palette.secondary.light}`,
        marginTop: theme.spacing(2),
        width: '100%',
    },
    subContainer: {
        backgroundColor: "white",
        borderRadius: theme.spacing(1)
    },
    droppingFiles: {
        opacity: .5
    },
    btn: {
        margin: theme.spacing(2)
    },
    inputContainer: {
        height: '200px',
        background: 'linear-gradient(100deg, rgba(25,209,146,0.5746673669467788) 0%, rgba(15,95,209,0.6222864145658263) 100%)'
    }
});


class ImageUploader extends UploaderBase {
    constructor(props) {
        super(props);

        this.setAllowedMimeTypes(['image/*']);
        this.setMaxNumUploads(1000);
        this.setInputElementId(INPUT_ID);
        this.cv = null;
    }

    cancel = () => {
        console.log("cancel clicked");
    }

    share = () => {
        console.log("share clicked");
    }

    componentDidMount = () => {
        const script = document.createElement("script");
        script.src = './opencv4.4.js';
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => {
            console.log("CV loaded.");
            this.setState({
                cvLoaded: true
            });
        }
    }

    setAlbumTitle = (event) => {
        val = event.target.value;
        this.setState({
            albumDescription: val
        })
    }

    render() {
        const { classes } = this.props;

        if (!this.state.cvLoaded) {
            return (
                <div>
                    <Typography variant="h5">
                        Please Wait For Uploader To Load...
                    </Typography>
                </div>
            );
        }

        console.log(this.state.uploads);
        return (
            <Container component="main" maxWidth="md" className={classes.root} >
                <Grid
                    container
                    direction="column"
                    justify="space-evenly"
                    alignItems="center"
                >
                    <Grid
                        container item
                        direction="row"
                        justify="center"
                        alignItems="center"
                        spacing={2}
                    >
                        <Box className={`${classes.container} ${this.state.filesHovering ? classes.droppingFiles : ''}`}
                            onDrop={this.dropHandler}
                            onDragOver={this.dragOverHandler}
                            onDragLeave={this.dragEndHandler}
                        >
                            {this.state.uploads.length > 0 &&
                                <Grid item xs={12}>
                                    <Box className={classes.subContainer} p={2}>
                                        <TextField 
                                            fullWidth 
                                            label="Please Enter Album Title" 
                                            variant="outlined" 
                                            onChange={this.setAlbumTitle}
                                        />
                                    </Box>
                                </Grid>
                            }


                            {this.state.uploads.map(upload =>
                                <Grid item xs={12} key={upload.uploadId + "_grid"}>
                                    <Upload
                                        uploadId={upload.uploadId}
                                        upload={upload}
                                        requestTagSuggestions={this.requestTagSuggestions}
                                        suggestions={upload.suggestions}
                                    />
                                </Grid>
                            )}


                            <Grid item container
                                className={classes.inputContainer}
                                direction="column"
                                justify="center"
                                alignItems="center" >
                                <input type="file" id={INPUT_ID} accept={this.allowedMimeTypes} multiple onChange={this.selectFilesUpload} />
                                <p>Or Drag and Drop Files</p>
                            </Grid>


                            {this.state.uploads.length > 0 &&
                                <Grid item container
                                    direction="row"
                                    justify="center"
                                    alignItems="flex-start" >
                                    <Button className={classes.btn} variant="contained" color="secondary" onClick={this.cancel} > Cancel </Button>
                                    <Button className={classes.btn} variant="contained" color="primary" onClick={this.share} > Share! </Button>
                                </Grid>
                            }

                        </Box>
                    </Grid>
                </Grid>
                <Test/>
            </Container>
        );
    }
}

export default withStyles(useStyles)(ImageUploader);