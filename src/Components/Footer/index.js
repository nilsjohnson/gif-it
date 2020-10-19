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
                <Link color="inherit" to="/bugs">
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
        marginTop: theme.spacing(2),
        padding: theme.spacing(1),
        position: 'absolute',
        right: 0,
        bottom: 0,
        left: 0
    },
    container: {

    }
}));

export default function Footer(props) {
    const classes = useStyles();

    return (
        <footer className={classes.footer}>
            <Container maxWidth="lg" className={classes.container}>
                <Typography variant="h6" align="center">
                    {"gif-it.io"}
                </Typography>
                <Typography variant="subtitle2" align="center" color="textSecondary" component="p">
                    {"Video to gif and media sharing."}
                </Typography>
                <Copyright />
            </Container>
        </footer>
    );
}

Footer.propTypes = {

};