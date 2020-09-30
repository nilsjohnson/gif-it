import React from 'react';
import ProgressBar from '../../ProgressBar';
import { Toolbar, Typography, IconButton } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
    toolbar: {
        flexWrap: 'wrap',
    },
    toolbarTitle: {
        flexGrow: 1,
    }
}));


export default function FileBar(props) {
    const { upload = {}, removeUpload, shiftUpload } = props;
    const classes = useStyles();

    const callRemoveUpload = () => {
        removeUpload(upload.uploadId);
    }

    const callShiftUp = () => {
        shiftUpload(upload.uploadId, -1);
    }

    const callShiftDown = () => {
        shiftUpload(upload.uploadId, 1);
    }
    return (
        <Toolbar className={classes.toolbar}>
            <Typography variant="h6" color="inherit" noWrap={true} className={classes.toolbarTitle}>
                {upload.file.name}
            </Typography>

            {upload.status === 'uploading'
                ?
                <React.Fragment>
                     <ProgressBar value={upload.percentUploaded} />
                     <Typography>Please Wait...</Typography>   
                </React.Fragment>
                :
                <div>
                    <IconButton aria-label="move-up" onClick={callShiftUp} >
                        <ArrowUpwardIcon />
                    </IconButton>
                    <IconButton arai-label="move-down" onClick={callShiftDown} >
                        <ArrowDownwardIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={callRemoveUpload} >
                        <CloseIcon />
                    </IconButton>
                </div>
            }

        </Toolbar>
    );
}