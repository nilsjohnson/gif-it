import React from 'react';
import ProgressBar from '../../ProgressBar';
import { Toolbar, Typography, IconButton } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

import CloseIcon from '@material-ui/icons/Close';
import ShiftButtons from './ShiftButtons';
import { UploadState } from '../UploadState';

const useStyles = makeStyles((theme) => ({
    toolbar: {
        flexWrap: 'wrap',
    },
    toolbarTitle: {
        flexGrow: 1,
    }
}));


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
        <Toolbar className={classes.toolbar}>
            <Typography variant="h6" color="inherit" noWrap={true} className={classes.toolbarTitle}>
                {upload.file.name}
            </Typography>

            {upload.uploadState === UploadState.UPLOADING 
                || upload.uploadState === UploadState.PENDING_RENDER
                || upload.uploadState === UploadState.DONE
                ?
                <React.Fragment>
                     <ProgressBar value={upload.percentUploaded} />
                     <Typography>Please Wait...</Typography>   
                </React.Fragment>
                :
                <React.Fragment>
                    
                    { showShift && 
                    <ShiftButtons callShiftUp={callShiftUp} 
                    callShiftDown={callShiftDown}/> }

                    <IconButton aria-label="delete" onClick={callRemoveUpload} >
                        <CloseIcon />
                    </IconButton>
                </React.Fragment>
            }

        </Toolbar>
    );
}