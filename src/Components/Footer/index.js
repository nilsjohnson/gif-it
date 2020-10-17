import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

function Copyright() {
    return (
        <React.Fragment>
            <Typography variant="body2" color="textSecondary" align="center">
                <Link color="inherit" to="/blog">
                    Blog
                </Link>
                {' | '}
                <Link color="inherit" to="https://github.com/nilsjohnson/gif-it/issues">
                    Bug Report / Feedback
                </Link>
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
                {'Copyright © '}
                gif-it.io
                {' '}
                {new Date().getFullYear()}
            </Typography>
        </React.Fragment>
    );
}

const useStyles = makeStyles((theme) => ({
    footer: {
        backgroundColor: theme.palette.background.paper,
        // marginTop: theme.spacing(8),
        padding: theme.spacing(6, 0),
    },
}));

export default function Footer(props) {
    const classes = useStyles();

    return (
        <footer className={classes.footer}>
            <Container maxWidth="lg">
                <Typography variant="h6" align="center" gutterBottom>
                    {"gif-it.io"}
                </Typography>
                <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                    {"Video to gif and media sharing."}
                </Typography>
                <Copyright />
            </Container>
        </footer>
    );
}

Footer.propTypes = {

};