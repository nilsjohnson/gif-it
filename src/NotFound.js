import React from "react";
import Header from "./Components/Header";
import Box from "@material-ui/core/Box";
import Footer from './Components/Footer';
import { Grid, Container, Typography, withStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    img: {
        width: '100%'
    }
}));

export default function NotFound(props) {

    const classes = useStyles();

    return (
        <Box>
            <Header />
            <Container>
                <Typography variant='h4' align='center'>
                    404, not found.
                </Typography>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                >
                    <Grid item xs={1} sm={2} md={3}></Grid>
                    <Grid item xs={10} sm={8} md={6}>
                        <img className={classes.img} src='/404.gif' />
                    </Grid>
                    <Grid item xs={1} sm={2} md={3}></Grid>

                </Grid>

            </Container>
            <Footer />
        </Box>
    );
}

