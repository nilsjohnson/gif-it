import React from 'react'
import PropTypes from "prop-types";
import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
    tagContainer: {
        backgroundColor: theme.palette.primary.light,
        margin: theme.spacing(1),
        borderRadius: theme.spacing(1)
    },
    withButton: {
        paddingLeft: theme.spacing(1),
    },
    withoutButton: {
        padding: theme.spacing(1)
    },
    iconContainer: {
        verticalAlign: 'middle',
        display: 'inline-flex',
        marginLeft: theme.spacing(1)
    },
    linkStyle: {
        textDecoration: 'none',
        color: 'rgba(0, 0, 0, 0.87)'
    }
}));


export default function Tag(props) {
    const classes = useStyles();

    const removeTag = () => {
        console.log("removing " + props.tag);
        props.removeTag(props.tag)
    };

    return (
        <span className={`${classes.tagContainer} ${props.removeTag ? classes.withButton : classes.withoutButton}`}>

            {props.explorable ?
                <Link className={classes.linkStyle}
                    to={{
                        pathname: "/explore",
                        search: `?search=${props.tag}`
                    }}
                >
                    <Typography component='span' variant='subtitle1'>
                        {"#" + props.tag}
                    </Typography>
                </Link>
                :
                <Typography component='span' variant='subtitle1'>
                    {"#" + props.tag}
                </Typography>
            }

                {props.removeTag && <span className={classes.iconContainer}>
                <IconButton onClick={removeTag} aria-label="search">
                    <CancelIcon />
                </IconButton>
        </span> }

        </span>
    );
}

Tag.propTypes = {
    tag: PropTypes.string,
    explorable: PropTypes.bool,
    removeTag: PropTypes.func
}
