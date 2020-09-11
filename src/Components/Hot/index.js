import React, { Component } from "react";

import UploaderBase from "../UploaderBase";

import { withStyles } from '@material-ui/core/styles';


const INPUT_ID = "muhid";

const useStyles = theme => ({
    item: {
        backgroundColor: "green"
    }

});

class Hot extends UploaderBase {
    constructor(props) {
        super(props);
    }


    render() {
        const { classes } = this.props;

        return (
            <div className={classes.item}>
                GEAR gear gear here gear gear
            </div>
        );
    }
}

export default withStyles(useStyles)(Hot);