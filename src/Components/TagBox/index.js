import React from 'react';
import { Grid, TextareaAutosize, Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    textInput: {
        width: "95%"
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
        spacing={2}>

            <Grid item>
                <TextField className={classes.textInput} multiline rows={3}  label={"Please Enter Description"}variant="outlined" onChange={props.setDescription} />
            </Grid>

            <Grid item>
                <TextField className={classes.textInput} label={"Please Enter Tags"}variant="outlined" onChange={props.setTags} />
            </Grid>

            <Grid item >
                <Button className={classes.btn} variant="contained" color="primary" onClick={props.share} > Tag it and Share! </Button>
                <Button className={classes.btn} variant="contained" color="primary" onClick={props.download} > Download </Button>
                <Button className={classes.btn} variant="contained" color="secondary" onClick={props.cancel} > Cancel </Button>

            </Grid>

        </Grid>
    );
}