import { Box, Grid, IconButton, withStyles, Typography } from '@material-ui/core';
import React, { Component } from 'react';
import FilterIcon from '@material-ui/icons/Filter';


const useStyles = theme => ({
    root: {

    }
});

class FilterPalette extends Component {
    
    // we wrap these methods because we dont
    // want to pass the event up.
    doGrayscale = (event) => {
        this.props.grayscale();
    }

    doOrignal = (event) => {
        this.props.original();
    }

    doGaussianBlur = (event) => {
        this.props.gaussianBlur();
    }

    render() {
        return (
            <Box m={1}>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                >
                    <Grid item
                        container
                        direction="column"
                        justify="flex-start"
                        alignItems="flex-start"
                        xs={12}
                    >
                        {/* blck white */}
                        <IconButton onClick={this.doGrayscale}>
                            <FilterIcon />
                            <Typography variant="subtitle1">Grayscale</Typography>
                        </IconButton>

                        {/* Gaussian Blur Example */}
                        <IconButton onClick={this.doGaussianBlur}>
                            <FilterIcon />
                            <Typography variant="subtitle1">Smooth</Typography>
                        </IconButton>

                        {/* No Filter*/}
                        <IconButton onClick={this.doOrignal}>
                            <FilterIcon />
                            <Typography variant="subtitle1">Original</Typography>
                        </IconButton>

                    </Grid>
                </Grid>
            </Box>
        );
    }
}

export default withStyles(useStyles)(FilterPalette)