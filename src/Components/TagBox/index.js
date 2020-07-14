import React from 'react';
import { Grid, TextareaAutosize, Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    fullWidth: {
        width: "100%"
    },
    btn: {
        margin: theme.spacing(1)
    }
}));

export function TagBox(props) {
    const classes = useStyles();

    return (
        <Grid
        container
        direction="column"
        justify="space-evenly"
        alignItems="center"
        spacing={2}>

            <Grid item>
                <TextField fullWidth multiline rows={3}  label={"Please Enter Description"}variant="outlined" onChange={props.setTags} />
            </Grid>

            <Grid item>
                <TextField fullWidth label={"Please Enter Tags"}variant="outlined" onChange={props.setTags} />
            </Grid>

            <Grid item >
                <Button className={classes.btn} variant="contained" color="Primary" onClick={props.share} > Tag it and Share! </Button>
                <Button className={classes.btn} variant="contained" color="Secondary" onClick={props.cancel} > Don't Share </Button>
            </Grid>

        </Grid>
    );
}