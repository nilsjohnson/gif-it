import React from 'react';
import { Grid, Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    textInput: {
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
            container item
            direction="column"
            justify="space-evenly"
            spacing={2}>
            <Grid item>
                <TextField className={classes.textInput} multiline rows={3} label={"Please Enter Description"} variant="outlined" onChange={props.setDescription} />
            </Grid>

            <Grid item>
                <TextField className={classes.textInput} label={"Please Enter Tags"} variant="outlined" onChange={props.setTags} />
            </Grid>

            <Grid item container
                direction="row"
                justify="space-evenly"
                alignItems="flex-start" >
                <Button className={classes.btn} variant="contained" color="primary" onClick={props.cancel} > Cancel </Button>
                {/* <Button className={classes.btn} variant="contained" color="secondary" > Download </Button> */}
                <Button className={classes.btn} variant="contained" color="secondary" onClick={props.share} > Tag it and Share! </Button>

            </Grid>
        </Grid>
    );
}