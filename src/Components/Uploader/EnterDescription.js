import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, TextField } from '@material-ui/core';

const MAX_LENGTH = 1000;

/**
 * The component that handles user entering description of the gif.
 */
export default class EnterDescription extends Component {
    constructor(props) {
        super(props);

        this.state = ({
            curInput: "",
            isValidInput: true,
            errorMessage: ""
        });
    }

    /**
     * Sanitizes raw input.
     * @param {*} input What the user entered
     * @return the input without leading or trailing whitespace.
     */
    makeDescription = (input) => {
        console.log(input.trim());
        return input.trim();
    }

    /**
     * @param {*} description The sanitzed user input
     * @return {string} Error message if error, otherwise empty string.
     */
    validateDescription = (description) => {
        if(description.length <= MAX_LENGTH) {
            return '';
        }
        
        return(`Description must be less than ${MAX_LENGTH} characters.`);
    }

    /**
     * Handles user entering description. Sets the description if input is valid, otherwise marks error
     * and sets description to null.
     */
    setCurInput = (event) => {
        let input = event.target.value;
        let description = this.makeDescription(input);
        let errorMessage = this.validateDescription(description);
    
        if(errorMessage) {
            this.props.setDescription(null);
        }
        else {
            this.props.setDescription(description);
        }

        this.setState({
            curInput: input,
            isValidInput: errorMessage ? false : true,
            errorMessage: errorMessage
        });
    }

    render() {
        return (
            <Grid item>
                <TextField 
                    multiline fullWidth rows={3} 
                    label={"Please Enter Description"} 
                    variant="outlined" onChange={this.setCurInput} 
                    value={this.state.curInput}
                    error={!this.state.isValidInput}
                    helperText={this.state.errorMessage}
                />
            </Grid>
        );
    }
}

EnterDescription.propTypes = {
    setDescription: PropTypes.func
}