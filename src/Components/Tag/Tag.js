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

    const { tag, count, explorable } = props;

    return (
        <span className={`${classes.tagContainer} ${props.removeTag ? classes.withButton : classes.withoutButton}`}>

            {explorable ?
                <Link className={classes.linkStyle}
                    to={{
                        pathname: "/explore",
                        search: `?search=${tag}`
                    }}
                >
                    <Typography component='span' variant='subtitle1'>
                        {"#" + tag}
                    </Typography>
                </Link>
                :
                <Typography component='span' variant='subtitle1'>
                    {"#" + tag}
                </Typography>
            }

                {props.removeTag ? <span className={classes.iconContainer}>
                <IconButton onClick={removeTag} aria-label="search">
                    <CancelIcon />
                </IconButton>
        </span> : <span>{count && ` (${count})`}</span>}

        </span>
    );
}

Tag.propTypes = {
    tag: PropTypes.string,
    explorable: PropTypes.bool,
    removeTag: PropTypes.func,
    count: PropTypes.number
}
