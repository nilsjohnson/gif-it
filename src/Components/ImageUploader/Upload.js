import React, { Component } from "react";

import { Grid, Button, Card, CardContent } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import EnterDescription from "../UploaderBase/EnterDescription";
import { scaleMat } from "./cvUtil";
import TagInputBox from '../TagInputBox';
import ProgressBar from '../ProgressBar';

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
    root: {
        
    }
});

class Upload extends Component {
    constructor(props) {
        super(props);

        this.state = {
            description: "",
            tags: []
        };
    }

    componentDidMount = () => {
        const { upload } = this.props;

        let srcElem = document.getElementById("cavas-in-" + upload.uploadId);
        let dstElem = document.getElementById("cavas-out-" + upload.uploadId);

        scaleMat(srcElem, dstElem, upload.file, 500);
    }

    setDescription = (input) => {
        console.log(input);
        this.setState({ description: input });
    }


    addTag = (tag) => {
        console.log("add tag fired: " + tag);
        let tags = this.state.tags;
        tags.push(tag);
        this.setState({
            tags: tags
        });
    }

    removeTag = (tag) => {
        let tags = this.state.tags;
        for(let i = 0; i < tags.length; i++) {
            if(tags[i] === tag) {
                tags.splice(i, 1);
                break;
            }
        }

        this.setState({ tags: tags});

    }

    share = () => {
        console.log("share fired");
    }

    componentDidUpdate = () => {
        
    }

    requestTagSuggestions = (curInput) => {
        const { requestTagSuggestions, uploadId } = this.props;
        requestTagSuggestions(uploadId, curInput);
      }

    render() {
        const { classes, upload = {} } = this.props;

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
                        <ProgressBar value={this.props.upload.percentUploaded}/>
                    </Grid>
                    <Grid item xs={10}>
                        <canvas className={classes.fullWidth} id={"cavas-out-" + upload.uploadId} ></canvas>
                        <img className={classes.hidden} id={"cavas-in-" + upload.uploadId} ></img>
                    </Grid>
                    <Grid xs={10} item>
                        <EnterDescription setDescription={this.setDescription} />
                    </Grid>
                    <Grid xs={10} item>
                        <TagInputBox
                            suggestions={this.props.upload.suggestions}
                            tags={this.state.tags}
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

export default withStyles(useStyles)(Upload);