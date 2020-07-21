import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import { Grid, Box, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({

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
            <Box>
                <Grid
                    container item
                    direction="column"
                    justify="flex-start"
                    alignItems="flex-start"
                    className={this.props.error && classes.error}
                >
                    <Grid item>
                        <Typography variant="h5" component="h2">
                            {this.props.fileName}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Box component="div">
                            <p>Speed: {this.props.speed} </p>
                            <p>Progress: {this.props.error ? "error" : "" || this.props.progress} </p>
                        </Box>
                    </Grid>
                </Grid>
                {this.props.error ?
                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                        spacing={1}
                    >
                        <Grid item>
                            <Typography variant="subtitle1" component="h5">
                                {this.props.error}
                            </Typography>
                        </Grid>
                        <Grid item>
                        <Button variant="contained" color="secondary" onClick={this.props.cancel}>Close</Button>
                        </Grid>
                    </Grid>
                    : ""}
            </Box>


        );
    }
}

export default withStyles(useStyles)(ConversionBox);
