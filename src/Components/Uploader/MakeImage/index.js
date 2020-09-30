import React, { Component } from "react";
import { Grid, Card } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import EnterDescription from "../EnterDescription";
import { scaleMat } from "../cvUtil";
import TagInputBox from '../../TagInputBox';
import FileBar from "./FileBar";

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
    }
});

class MakeImage extends Component {
    constructor(props) {
        super(props);

        const { upload } = this.props;

        this.state = {
            src: URL.createObjectURL(upload.file),
        };
    }

    componentDidMount = () => {
        const { upload } = this.props;
        let src = document.getElementById("input-" + upload.uploadId);
        let dst = document.getElementById("thumb-" + upload.uploadId);
        scaleMat(src, dst, 300, (blob) => {
            this.props.onThumbnailMade(upload.uploadId, blob);
        });

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

    componentDidUpdate = () => {
        
    }

    requestTagSuggestions = (curInput) => {
        const { requestTagSuggestions, uploadId } = this.props;
        requestTagSuggestions(uploadId, curInput);
      }

    render() {
        const { classes, upload = {}, removeUpload, shiftUpload } = this.props;

        return (
            <Card className={classes.card}>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    spacing={2}
                    className="root"
                >
                    <Grid item xs={10}>
                        <FileBar 
                            upload={upload}
                            removeUpload={removeUpload}
                            shiftUpload={shiftUpload}
                        />
                    </Grid>
                    <Grid item xs={10}>
                        {/* <canvas className={`${classes.fullWidth} ${upload.status === "uploading" ? classes.uploading: ""}`} id={"cavas-out-" + upload.uploadId} ></canvas> */}
                        <img className={`${classes.fullWidth} ${upload.status === "uploading" ? classes.uploading: ""}`} id={"input-" + upload.uploadId} src={this.state.src}></img>
                        <canvas className={classes.hidden} id={"thumb-" + upload.uploadId} src={this.state.src}/>
                    </Grid>
                    <Grid xs={10} item>
                        <EnterDescription setDescription={this.setDescription} />
                    </Grid>
                    <Grid xs={10} item>
                        <TagInputBox
                            suggestions={upload.suggestions}
                            tags={upload.tags}
                            addTag={this.addTag}
                            removeTag={this.removeTag}
                            requestTagSuggestions={this.requestTagSuggestions}
                            share={this.share}
                        />
                    </Grid>
                </Grid>    
            </Card>
        );
    }
}

export default withStyles(useStyles)(MakeImage);