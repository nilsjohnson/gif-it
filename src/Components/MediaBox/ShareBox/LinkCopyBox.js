import React from "react";
import PropTypes from 'prop-types';
import { TextField, Grid, Tooltip } from '@material-ui/core';

export function LinkCopyBox(props) {
    const [open, setOpen] = React.useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        document.execCommand('selectAll', false, null);
        document.execCommand('copy', false, null);
        console.log("Copied To Clipboard");
        setOpen(true);
        setTimeout(() => {
            handleTooltipClose();
        }, 1000);
    };

    return (
        <Grid
            container item
            direction="row"
            justify="center"
            alignItems="center"
        >
            <Grid item sm={2} md={3}></Grid>
            <Grid item xs={12} sm={8} md={6} >
                <Tooltip
                    PopperProps={{
                        disablePortal: true,
                    }}
                    onClose={handleTooltipClose}
                    open={open}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title="Copied To Clipboard"
                    placement="right"
                >
                    <TextField
                        fullWidth={true}
                        onClick={handleTooltipOpen}
                        label={props.type}
                        value={props.text}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Tooltip>
            </Grid>
            <Grid item sm={2} md={3}></Grid>
        </Grid>
    );
}

LinkCopyBox.prototypes = {
    type: PropTypes.string,
    text: PropTypes.string
};