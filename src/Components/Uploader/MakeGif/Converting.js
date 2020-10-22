import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Grid, Box } from '@material-ui/core';
import PropTypes from 'prop-types';


function Converting(props) {
    const { speed, fileName, progress, error } = props;
    return (
        <Box p={2}>
            <Grid
                container item
                direction="column"
                justify="flex-start"
                alignItems="flex-start"
            >
                <Grid item>
                    <Typography noWrap variant="h5">
                        {fileName}
                    </Typography>
                </Grid>
                <Grid item>
                    <Box component="div">
                        <p>Speed: {speed} </p>
                        <p>Progress: {error ? "error" : "" || progress} </p>
                    </Box>
                </Grid>
                {error ?
                    <Grid
                        container item
                        direction="column"
                        justify="center"
                        alignItems="center"
                        spacing={1}
                    >
                        <Grid item>
                            <Typography variant="subtitle1" component="h5">
                                {error}
                            </Typography>
                        </Grid>
                    </Grid>
                    : ''}
            </Grid>
        </Box>
    );
}

Converting.propTypes = {
    fileName: PropTypes.string,
    speed: PropTypes.string,
    error: PropTypes.string,
    progress: PropTypes.string,
    cancel: PropTypes.func
}

export default Converting;
