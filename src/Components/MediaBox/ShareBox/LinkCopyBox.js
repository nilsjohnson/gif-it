import React from "react";
import PropTypes from 'prop-types';
import { TextField, Grid, Tooltip, withStyles, Box } from '@material-ui/core';

const useStyles = theme => ({
    input: {
        paddingBottom: theme.spacing(1),
    }

});

function LinkCopyBox(props) {
    const [open, setOpen] = React.useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const { classes } = props;

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
            justify="flex-start"
            alignItems="flex-start"
        >
            <Grid item xs={false} sm={1} md={2}></Grid>
            <Grid item xs={12} sm={10} md={8} >
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
                            className={classes.input}
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
            <Grid item xs={false} sm={1} md={2}></Grid>
        </Grid>
    );
}

LinkCopyBox.prototypes = {
    type: PropTypes.string,
    text: PropTypes.string
};

export default withStyles(useStyles)(LinkCopyBox);