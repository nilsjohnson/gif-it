import React from 'react';
import ProgressBar from '../../ProgressBar';
import { Toolbar, Typography, IconButton, Grid } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

import DeleteIcon from '@material-ui/icons/Delete';
import ShiftButtons from './ShiftButtons';
import { UploadState } from '../UploadState';
import { UploadType } from '../UploadType';

const useStyles = makeStyles(theme => ({
    buttonContainer: {
        display: 'flex',
    },
    buttons: {
        marginLeft: 'auto',
    },
    toolBar: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    }
}));

function shouldDisplayProgress(uploadState, uploadType) {
    if (uploadType === UploadType.VID_TO_GIF) {
        if (uploadState === UploadState.UPLOADING || uploadState === UploadState.PENDING_SHARE) {
            return true;
        }
    }

    if (uploadType === UploadType.IMG) {
        if (uploadState !== UploadState.SETTING_OPTIONS) {
            return true;
        }
    }

    return false;
}

function getMessage(uploadState) {
    switch (uploadState) {
        case UploadState.UPLOADING:
            return "Uploading...";
        case UploadState.RENDERING:
            return "Rendering...";
        case UploadState.DONE:
            return "Upload Succeeded";
        case UploadState.PENDING_RENDER:
            return "Waiting to be rendered...";
        case UploadState.PENDING_SHARE:
            return "Please Wait...";
        default:
            return "Please Wait...";
    }
}


export default function FileBar(props) {
    const { upload = {}, removeUpload, shiftUpload, showShift } = props;

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
        <Toolbar disableGutters={true} className={classes.toolBar}>
            <Grid container
                direction="row"
                justify="flex-start"
                alignItems="flex-start" >
                <Grid item xs={6}>
                    <Typography variant="h6" color="inherit" noWrap={true} >
                        {upload.getFile(upload.file).name}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <div className={classes.buttonContainer}>
                    {shouldDisplayProgress(upload.uploadState, upload.uploadType)
                        ?
                        <React.Fragment>
                            <ProgressBar value={upload.percentUploaded} />
                            <Typography variant="subtitle1">{getMessage(upload.uploadState)}</Typography>
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <div className={classes.buttons}>
                                {showShift &&
                                    <ShiftButtons callShiftUp={callShiftUp}
                                        callShiftDown={callShiftDown} />}

                                <IconButton aria-label="delete" onClick={callRemoveUpload} >
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        </React.Fragment>
                    }
                    </div>
                </Grid>

            </Grid>

        </Toolbar>
    );
}



