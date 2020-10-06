import React from 'react';
import { IconButton } from "@material-ui/core";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

export default function ShiftButtons(props) {
    return (
        <React.Fragment>
            <IconButton aria-label="move-up" onClick={props.callShiftUp} >
                <ArrowUpwardIcon />
            </IconButton>
            <IconButton arai-label="move-down" onClick={props.callShiftDown} >
                <ArrowDownwardIcon />
            </IconButton>
        </React.Fragment>
    );
}