import React from "react";
import { Typography, Container, Grid } from "@material-ui/core";
import UploaderBase from "../UploaderBase";
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

    render() {
        const { classes } = this.props;

        return (
            <Container component="main" maxWidth="md" >
                <Grid
                    container
                    direction="column"
                    justify="center"
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
                        justify="center"
                        alignItems="flex-start"
                        spacing={2}
                    >
                        {this.state.uploads.map(upload =>
                                <Grid item xs={12} key={upload.uploadId + "_grid"}>
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