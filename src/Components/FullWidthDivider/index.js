import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Divider } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    fullWidth: {
        width: '100%'
    }
}));


export default function FullWidthDivider(props) {
    const classes = useStyles();

    return (
        <Box className={classes.fullWidth}>
            <Divider />
        </Box>
    );
}

