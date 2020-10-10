import React, { Component } from "react";
import { Grid, Card, Box } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import EnterDescription from "../EnterDescription";
import TagInputBox from '../../TagInputBox';
import FileBar from "../FileBar";
import ImageEditor from "./ImageEditor";
import { UploadState } from "../UploadState";

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
        this.state = {
            loading: true
        }
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
        const { requestTagSuggestions, upload = {} } = this.props;
        requestTagSuggestions(upload.uploadId, curInput);
    }

    setLoading = (val) => {
        this.setState({
            loading: val
        });
    }

    render() {
        const { classes,
            upload = {},
            removeUpload,
            shiftUpload,
            singleImage,
            setMakeImages } = this.props;

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

                    {this.state.loading && <p>Loading...</p>}

                    <Grid item xs={12}>
                        <Box p={2}>
                            <ImageEditor
                                upload={upload}
                                setMakeImages={setMakeImages}
                                onLoad={this.setLoading}
                            />
                        </Box>
                    </Grid>



                    <Grid item container
                        direction='row'
                        justify="flex-start"
                        alignItems="flex-start"
                        spacing={2}
                    >
                        {/* <Grid item xs={false} sm={1}></Grid> */}
                        <Grid item xs={12}>
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
                        {/* <Grid item xs={false} sm={1}></Grid> */}
                    </Grid>
                </Grid>
            </Card>
        );
    }
}

export default withStyles(useStyles)(MakeImage);