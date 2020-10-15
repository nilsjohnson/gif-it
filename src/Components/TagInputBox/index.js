import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Tag from '../Tag/Tag'

const MAX_TAG_LENGTH = 32;
const MAX_NUM_TAGS = 10;

const useStyles = theme => ({
    tagInput: {
        flexGrow: 1
    },
    btn: {
        margin: theme.spacing(2)
    },
    tag: {
        backgroundColor: theme.palette.primary.light,
        margin: theme.spacing(1),
        borderRadius: theme.spacing(1)
    }
});

/**
 * This compoment allows users to enter tags
 */
class TagBox extends Component {
    constructor(props) {
        super(props)

        this.state = ({
            curInput: '',
            inputError: false,
            errorMessage: ''
        });

        this.inputFromSuggestion = false;
    }

    onEnterPressed = (event) => {
        if (event.keyCode === 13 && !this.inputFromSuggestion) {
            this.addTag();
        }
    }

    resetState = () => {
        this.setState({
            curInput: '',
            inputError: false,
            errorMessage: ''
        });
    }

    /*
    validates and adds a tag to the state
    */
    addTag = () => {
        const { tags = [] } = this.props;

        if(tags.length === MAX_NUM_TAGS) {
            
            this.setState({
                inputError: true,
                errorMessage: `No more than ${MAX_NUM_TAGS} tags allowed.`}
            );
            return;
        }

        if (this.state.inputError) {
            console.log(`'${this.state.curInput}' is not a valid tag. Cannot add it.`);
            return;
        }

        let tag = this.makeTag(this.state.curInput);

        if (tags.includes(tag)) {
            console.log("This tag is already added. Re-setting the input.");
            this.resetState();
            return;
        }
        if (tag === '') {
            return;
        }

        console.log("Adding " + tag);

        this.props.addTag(tag);
        this.resetState();
    }

    removeTag = (tag) => {
        this.props.removeTag(tag);
    }

    /**
     * @param {string} tag A santitized Tag
     * @return empty string if its a valid tag, otherwise an error message.
     */
    validateTag = (tag) => {
        let letters = /^[0-9a-zA-Z ]+$/;
        if (tag.match(letters) && tag.length <= MAX_TAG_LENGTH) {
            return '';
        }

        return `Must be alphanumeric and less that ${MAX_TAG_LENGTH} characters.`;
    }

    /**
     * Sanitizes a tag by getting rid of leading whitespace and '#' if present
     * @param {*} input 
     */
    makeTag = (input) => {
        // trim it
        let tag = input.trim();
        // remove a leading #
        if (tag.startsWith('#')) {
            tag = tag.substring(1)
        }
        // enforce single spacing for multi-word tags
        tag = tag.replace(/\s+/g, ' ');
        return tag;
    }

    /**
     * Takes an input string, validates it an adds it to state
     * @param {*} input 
     * @param {*} onComplete 
     */
    setCurInput_fromString = (input, onComplete = null) => {
        let tag = this.makeTag(input);
        let inputError = false;

        // if the tag is an empty string, the user must have entered
        // leading whitespace or a hashtag. This shouldn't trigger an error. 
        if (tag === '') {
            this.setState({
                curInput: input,
                inputError: inputError,
                errorMessage: ''
            });
            return;
        }

        let errorMessage = this.validateTag(tag);

        // if the tag is syntactically correct, request suggestions
        if (!errorMessage) {
            this.props.requestTagSuggestions(tag);
        }

        this.setState({
            curInput: input,
            inputError: errorMessage ? true : false,
            errorMessage: errorMessage
        }, onComplete);
    }

    /**
     * gets the the value from an event and adds it to the state
     * @param {} event 
     */
    setCurInput = (event) => {
        let input = event.target.value;
        this.setCurInput_fromString(input);
    }

    handleBlur = () => {
        //console.log("on blur called");
    }

    // this is a little weird. I would prefer to get the number in the pervious
    // step, but I cant see a way to map that at the moment. See how render gets the 
    // suggestion too understand this hack..
    getNumUses = (tag, suggestions) => {
        for (let i = 0; i < suggestions.length; i++) {
            if (suggestions[i].tag === tag) {
                return suggestions[i].numUses;
            }
        }
    }

    render() {
        const { suggestions, error, tags = [] } = this.props;

        // given that we dont know how quickly the user
        // will recieve the suggestions, we decide what to show
        // during render. 
        let visibleSuggestions = [];

        // if there is an active suggestion
        if (suggestions && this.state.curInput !== "") {
            // only show them if they match the current input
            for (let i = 0; i < suggestions.length; i++) {
                if (suggestions[i].tag.startsWith(this.state.curInput)) {
                    visibleSuggestions.push(suggestions[i]);
                }
            }
        }

        return (
            <Grid
                container item
                direction="row"
                justify="center"
                alignItems="stretch"
                spacing={1}
            >
                <Grid item xs={12}>
                    <Autocomplete
                        onChange={(event, newVal) => {
                            console.log("autocomplete onChange called");
                            if(newVal) {
                                this.setCurInput_fromString(newVal, this.addTag);
                            }
                        }}

                        onHighlightChange={(event, newVal, reason) => {
                            //console.log("onHighlightChange called");
                            //console.log(reason);
                            if(reason !== 'auto') {
                                this.inputFromSuggestion = true;
                            }
                            else{
                                this.inputFromSuggestion = false;
                            }
                        }}

                        onOpen={event => {
                            //console.log("on open called");
                        }}
                        onClose={event => {
                            //console.log("onClose called");
                        }}

                        value={this.state.curInput}
                        freeSolo
                        options={visibleSuggestions.map((suggestion) => suggestion.tag)}
                        renderOption={suggestion => {
                            return (<span>
                                <Typography component="span">
                                    {suggestion}
                                </Typography>
                                <Typography component="span" variant="subtitle2">
                                    {` (${this.getNumUses(suggestion, visibleSuggestions)})`}
                                </Typography>
                            </span>)
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Please Enter Tags"
                                margin="normal"
                                variant="outlined"
                                onChange={this.setCurInput}
                                onKeyDown={this.onEnterPressed}
                                onBlur={this.handleBlur}
                                value={this.state.curInput}
                                helperText={this.state.errorMessage}
                                error={this.state.inputError ? true : false}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <IconButton onClick={this.addTag} aria-label="Enter Tags">
                                            <AddIcon />
                                        </IconButton>
                                    ),
                                }}
                            />
                        )}
                        disableClearable
                        forcePopupIcon={false}
                    />
                </Grid>
                <Grid item>
                    <Grid
                        container item
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                    >
                        {tags.map((tag, index) => (
                            <Tag key={index} tag={tag} removeTag={this.removeTag} />
                        ))}
                    </Grid>
                    <Grid item>
                        {(error ? error : "")}
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

TagBox.propTypes = {
    tags: PropTypes.array,
    suggestions: PropTypes.array,
    addTag: PropTypes.func,
    removeTag: PropTypes.func,
    requestTagSuggestions: PropTypes.func
};


export default withStyles(useStyles)(TagBox);