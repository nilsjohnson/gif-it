import React from "react";
import PropTypes from 'prop-types';
import { TextField, Grid, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    // input: {
    //     width: "100%"
    // }
}));

function click(event) {

}

export function LinkCopyBox(props) {
    const classes = useStyles();

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
            alignItems="stretch"
        >
            <Grid item xs={10} sm={8} md={6} >
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
                        defaultValue={props.text}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Tooltip>
            </Grid>
        </Grid>
    );
}

LinkCopyBox.prototypes = {
    type: PropTypes.string,
    text: PropTypes.string
};