import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core';

const MAX_LENGTH = 100;

/**
 * The component that handles user entering description of the gif.
 */
export default class EnterAlbumTitle extends Component {
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
    makeTitle = (input) => {
        return input.trim();
    }

    /**
     * @param {*} description The sanitzed user input
     * @return {string} Error message if error, otherwise empty string.
     */
    validateDescription = (description) => {
        if (description.length <= MAX_LENGTH) {
            return '';
        }

        return (`Title must be less than ${MAX_LENGTH} characters.`);
    }

    /**
     * Handles user entering description. Sets the description if input is valid, otherwise marks error
     * and sets description to null.
     */
    setCurInput = (event) => {
        let input = event.target.value;
        let description = this.makeTitle(input);
        let errorMessage = this.validateDescription(description);

        this.setState({
            curInput: input,
            isValidInput: errorMessage ? false : true,
            errorMessage: errorMessage
        });
    }

    setTitle = (event) => {
        if (!this.state.errorMessage) {
            this.props.setAlbumTitle(this.makeTitle(this.state.curInput));   
        }
    }

    render() {
        return (
            <TextField
                multiline fullWidth={true} rows={1}
                label={"Enter Album Title"}
                variant="outlined" onChange={this.setCurInput}
                onBlur={this.setTitle}
                value={this.state.curInput}
                error={!this.state.isValidInput}
                helperText={this.state.errorMessage}
            />
        );
    }
}

EnterAlbumTitle.propTypes = {
    setAlbumTitle: PropTypes.func
}