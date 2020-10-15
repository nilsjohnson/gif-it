import React from 'react';
import { Grid, Card, Typography, withStyles, Box } from "@material-ui/core";
import FileBar from './FileBar';

const useStyles = theme => ({
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        border: `2px solid ${theme.palette.error.light}`
    }
});



function ShowError(props) {
    const { classes, upload = {}, removeUpload } = props;

    return (
        <Card className={classes.card}>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                spacing={2}
            >
                <Grid item xs={12}>
                    <FileBar
                        upload={upload}
                        showShift={false}
                        removeUpload={removeUpload}
                    />
                </Grid>
                <Grid item xs={false} sm={1}></Grid>
                <Grid item xs={12} sm={10}>
                    <Box p={2}>
                        <Typography variant="h6">{upload.err}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={false} sm={1}></Grid>
            </Grid>
        </Card>
    );
}

export default withStyles(useStyles)(ShowError);