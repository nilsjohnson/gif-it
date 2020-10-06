import { Box, Grid, IconButton, withStyles, Typography } from '@material-ui/core';
import React, { Component } from 'react';
import FilterIcon from '@material-ui/icons/Filter';


const useStyles = theme => ({
    root: {
        
    }
});

class FilterPalette extends Component {
    render() {
        const { grayscale, 
            gaussianBlur, 
            original
        } = this.props;

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
                        <IconButton onClick={grayscale}>
                            <FilterIcon />
                            <Typography variant="subtitle1">Greyscale</Typography>
                        </IconButton>

                        {/* Gaussian Blur Example */}
                        <IconButton onClick={gaussianBlur}>
                            <FilterIcon />
                            <Typography variant="subtitle1">Smooth</Typography>
                        </IconButton>

                        {/* No Filter*/}
                        <IconButton onClick={original}>
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