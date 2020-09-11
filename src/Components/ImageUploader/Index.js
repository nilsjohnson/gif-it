import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { DropBox } from "../DropBox";
import { Typography, Paper, Container, Grid } from "@material-ui/core";
import UploaderBase from "../UploaderBase/Index";
import Upload from "../GifUploader/Upload";
import { withStyles } from '@material-ui/core/styles';
import EditImage from "./EditImage";

const INPUT_ID = "img-uploader-input";

const useStyles = theme => ({


});

class ImageUploader extends UploaderBase {
    constructor(props) {
        super(props);

        this.setAllowedMimeTypes(['image/*']);
        this.setMaxNumUploads(1000);
        this.setInputElementId(INPUT_ID);
        this.cv = null;


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

    componentDidMount = () => {

    }

    render() {
        console.log(this.cv);
        const { classes } = this.props;
        console.log(classes);

        return (
            <Container component="main" maxWidth="md" >
               <p>hot</p>
                <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="center"
                >
                    <Grid item >
                        {this.state.cvLoaded
                            ? <input type="file" id={INPUT_ID} accept={this.allowedMimeTypes} multiple onChange={this.selectFilesUpload} />
                            : <Typography variant="subtitle2">Loading...</Typography>
                        }

                    </Grid>

                    <Grid
                        container item
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                    >
                        {this.state.uploads.map(upload =>
                            <Grid item xs={6} key={upload.uploadId + "_grid"}>
                                <EditImage
                                    upload={upload}
                                />
                            </Grid>
                        )}
                    </Grid>

                </Grid>
            </Container>
        );
    }
}

export default withStyles(useStyles)(ImageUploader);