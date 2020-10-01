import React, { Component } from "react";
import { Grid, Card, IconButton, Box } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import EnterDescription from "../EnterDescription";
import { scaleMat } from "../cvUtil";
import TagInputBox from '../../TagInputBox';
import FileBar from "../FileBar";
import CropIcon from '@material-ui/icons/Crop';
import ImageEditor from "./ImageEditor";

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
        backgroundColor: theme.palette.success.light
    }
});

class MakeImage extends Component {
    constructor(props) {
        super(props);

        const { upload } = this.props;
    }



    setDescription = (input) => {
        const { upload = {}, setDescription } = this.props;
        setDescription(upload.uploadId, input);
    }


    addTag = (tag) => {
        this.props.addTag(this.props.upload, tag);
    }

    removeTag = (tag) => {
        this.props.removeTag(this.props.upload, tag);
    }

    requestTagSuggestions = (curInput) => {
        const { requestTagSuggestions, uploadId } = this.props;
        requestTagSuggestions(uploadId, curInput);
    }



    render() {
        const { classes,
            upload = {},
            removeUpload,
            shiftUpload,
            singleImage,
            onThumbnailMade } = this.props;

        console.log(this.props);

        return (
            <Card className={classes.card}>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={2}
                >
                    <Grid item xs={12}>
                        <FileBar
                            upload={upload}
                            removeUpload={removeUpload}
                            shiftUpload={shiftUpload}
                            showShift={!singleImage}
                        />
                    </Grid>

                    <Box p={2}>
                        <ImageEditor
                            upload={upload}
                            onThumbnailMade={onThumbnailMade}
                        />
                    </Box>


                    <Grid xs={0} sm={1}></Grid>
                    <Grid xs={12} sm={10} item>
                        <Box p={2}>
                            <EnterDescription
                                setDescription={this.setDescription}
                            />
                            <TagInputBox
                                suggestions={upload.tagSuggestions}
                                tags={upload.tags}
                                addTag={this.addTag}
                                removeTag={this.removeTag}
                                requestTagSuggestions={this.requestTagSuggestions}
                                share={this.share}
                            />
                        </Box>
                    </Grid>
                    <Grid xs={0} sm={1}></Grid>
                </Grid>
            </Card>
        );
    }
}

export default withStyles(useStyles)(MakeImage);