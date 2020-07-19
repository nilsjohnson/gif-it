import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
//import { withStyles } from '@material-ui/core/styles';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Grid, Box } from '@material-ui/core';
import ProgressBar from '../ProgressBar';
import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
    root: {
        width: '100%',
        margin: "8px"
    },
    title: {
        fontSize: 14,
    },
    center: {
        textAlign: 'center'
    }
});

class ConversionBox extends Component {
    constructor(props) {
        super(props)

        this.state = {
            convertClicked: false
        };
    }

    convert = (event) => {
        console.log("convert button pressed");
        this.setState({
            convertClicked: true
        });

        this.props.convert();
    }

    render() {
        const { classes } = this.props;
        return (
            <Grid
                container item
                direction="column"
                justify="flex-start"
                alignItems="flex-start"
            >
                <Grid item>
                    <Typography variant="h5" component="h2">
                        {this.props.fileName}
                    </Typography>
                </Grid>
                <Grid item>
                    <Box component="div">
                        <p>Speed: {this.props.speed} </p>
                        <p>Progress: {this.props.progress} </p>
                    </Box>
                </Grid>
            </Grid>

        );
    }
}

export default withStyles(useStyles)(ConversionBox);
