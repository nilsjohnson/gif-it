import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(theme => ({
    tagContainer: {
        backgroundColor: theme.palette.primary.light,
        margin: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        borderRadius: theme.spacing(1),
    },
    iconContainer: {
        verticalAlign: 'middle',
        display: 'inline-flex',
        marginLeft: theme.spacing(1)
    }
}));


export default function Tag(props) {

    const classes = useStyles();
    
    const removeTag = () => {
        console.log("removing " + props.tag);
        props.removeTag(props.tag)
    };

    return (
        <span className={classes.tagContainer}>
            <span>
                {"#" + props.tag}
            </span>
            <span className={classes.iconContainer}>
                <IconButton onClick={removeTag} aria-label="search">
                    <CancelIcon />
                </IconButton>

            </span>
        </span>
    );
}

