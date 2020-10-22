import { Box, withStyles, TextField } from '@material-ui/core';
import React, { Component } from 'react';


const useStyles = theme => ({
    // root: {
    //     padding: theme.spacing(2)
    // }
});

class ResizePalette extends Component {
    constructor(props) {
        super(props);

        this.state = {
            widthErr: false,
            heightErr: false
        }

    }

    makeInput = (val) => {
        return parseInt(val);
    }

    isValidInput = (val) => {
        if(isNaN(val)) {
            return false;
        }
        if(val > 12000) {
            console.log("Max size is 12000px in either direction.")
            return false;
        }
        return true;
    }

    validateWidth = (event) => {
        let input = event.target.value;
        let sanitizedInput = this.makeInput(input);

        let newDimensions = JSON.parse(JSON.stringify(this.props.dimensions));
        newDimensions.enteredWidth = input;
        newDimensions.widthInputErr = false;

        if(this.isValidInput(sanitizedInput)) {
            let newHeight = Math.round(newDimensions.widthRatio*sanitizedInput);
            newDimensions.enteredHeight = newHeight;
        }
        else {
            console.log("width error");
            newDimensions.widthInputErr = true;
        }
        this.props.setNewSize(newDimensions);
    }

    validateHeight = (event) => {
        let input = event.target.value;
        let sanitizedInput = this.makeInput(input);

        let newDimensions = JSON.parse(JSON.stringify(this.props.dimensions));
        newDimensions.enteredHeight = input;
        newDimensions.heightInputErr = false;

        if(this.isValidInput(sanitizedInput)) {
            let newWidth = Math.round(newDimensions.heightRatio*sanitizedInput);
            newDimensions.enteredWidth = newWidth;
        }
        else {
            newDimensions.heightInputErr = true;
        }
        this.props.setNewSize(newDimensions);
    }

    setWidth = (event) => {
        let input = event.target.value;
        let sanitizedInput = this.makeInput(input);

        
        let newDimensions = JSON.parse(JSON.stringify(this.props.dimensions));// this.props.dimensions;
        newDimensions.enteredWidth = input;
        newDimensions.widthInputErr = false;

        if(this.isValidInput(sanitizedInput)) {
            newDimensions.width = sanitizedInput;
            let newHeight = Math.round(newDimensions.widthRatio*sanitizedInput);
            newDimensions.height = newHeight;
            newDimensions.enteredHeight = newHeight;
        }
        else {
            console.log("width error");
            newDimensions.widthInputErr = true;
        }

        console.log(newDimensions);
        this.props.setNewSize(newDimensions);
    }

    setHeight = (event) => {
        let input = event.target.value;
        let sanitizedInput = this.makeInput(input);

        
        let newDimensions = JSON.parse(JSON.stringify(this.props.dimensions));
        newDimensions.enteredHeight = input;
        newDimensions.heightInputErr = false;

        if(this.isValidInput(sanitizedInput)) {
            newDimensions.height = sanitizedInput;
            let newWidth = Math.round(newDimensions.heightRatio*sanitizedInput);
            newDimensions.width = newWidth;
            newDimensions.enteredWidth = newWidth;
        }
        else {
            console.log("height error");
            newDimensions.heightInputErr = true;
        }

        console.log(newDimensions);
        this.props.setNewSize(newDimensions);
    }



    render() {
        const { dimensions = { } } = this.props;
        const { enteredWidth =  0, enteredHeight = 0, widthInputErr = false, heightInputErr = false} = dimensions

        return (
            <Box m={1}>
                <Box m={2}>
                    <TextField variant="outlined"
                        label = "pixels wide"
                        error = {widthInputErr} 
                        onChange={this.validateWidth}
                        onBlur={this.setWidth} 
                        value={enteredWidth} 
                    />
                </Box>
                <Box m={2}>
                    <TextField variant="outlined" 
                        label = "pixels tall"
                        error={heightInputErr} 
                        onChange={this.validateHeight}
                        onBlur={this.setHeight}  
                        value={enteredHeight}
                    />
                </Box>
            </Box>
        );
    }
}

export default withStyles(useStyles)(ResizePalette)