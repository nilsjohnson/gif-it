import React, { Component } from "react";

import { Grid, Button, Card, CardContent } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import EnterDescription from "../UploaderBase/EnterDescription";

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
        flexDirection: 'column'
    }
});

class EditImage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            description: ""
        };
    }

    componentDidMount = () => {

    }

    setDescription = (input) => {
        console.log(input);
        this.setState({ description: input });
    }

    componentDidUpdate = () => {
        const { upload } = this.props;

        let inputElem = document.getElementById("cavas-in-" + upload.uploadId);
        inputElem.onload = () => {
            let outputElem = document.getElementById("cavas-out-" + upload.uploadId);
            let mat = cv.imread(inputElem);
            console.log(mat);
            if (mat.rows > 500 || mat.cols > 500) {
                let dsize = new cv.Size(300, 300);
                let dst = new cv.Mat();
                cv.resize(mat, dst, dsize, 0, 0, cv.INTER_AREA);
                mat.delete();
                cv.imshow(outputElem, dst);
            }
            else {
                cv.imshow(outputElem, mat);
            }


        }
        inputElem.src = URL.createObjectURL(upload.file);


    }

    render() {
        const { classes, upload = {} } = this.props;

        return (
            <Card className={classes.card}>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                >
                    <Grid item xs={10}>
                        <canvas className={classes.fullWidth} id={"cavas-out-" + upload.uploadId} ></canvas>
                        <img className={classes.hidden} id={"cavas-in-" + upload.uploadId} ></img>
                    </Grid>
                    <Grid item xs={2}>
                        <Grid
                            container
                            direction="column"
                            justify="flex-start"
                            alignItems="flex-start"
                        >
                            <Button>b1</Button>
                            <Button>b2</Button>
                            <Button>b3</Button>
                            <Button>b4</Button>
                        </Grid>
                    </Grid>

                </Grid>
                <CardContent className={classes.cardContent}>
                    <EnterDescription setDescription={this.setDescription} />
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(useStyles)(EditImage);