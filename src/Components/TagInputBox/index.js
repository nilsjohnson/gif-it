import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Tag from '../Tag/Tag'

const MAX_TAG_LENGTH = 32;

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
 * TODO move the description input into its own component.
 */
class TagBox extends Component {
    constructor(props) {
        super(props)

        this.state = ({
            curInput: '',
            inputError: false,
            errorMessage: ''
        });

        this.visibleSuggestion = [];
    }

    onEnterPressed = (event) => {
        if (event.keyCode === 13) {
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
        if(this.state.inputError) {
            console.log(`'${this.state.curInput}' is not a valid tag. Cannot add it.`);
            return;
        }

        let tag = this.makeTag(this.state.curInput);

        if (this.props.tags.includes(tag)) {
            console.log("This tag is already added. Re-setting the input.");
            this.resetState();
            return;
        }
        if(tag === '') {
            return;
        }

        console.log("Adding " + tag);

        this.props.addTag(tag);
        this.resetState();
        this.visibleSuggestion = [];
    }

    removeTag = (tag) => {
        this.props.removeTag(tag);
    }

    /**
     * 
     * @param {string} tag A santitized Tag
     * @return empty string if its a valid tag, otherwise an error message.
     */
    validateTag = (tag) => {
        console.log(`testing tag '${tag}'`);
        let letters = /^[0-9a-zA-Z ]+$/;
        if (tag.match(letters) && tag.length <= MAX_TAG_LENGTH) {
            return '';
        }

        return `Must be alphanumeric and less that ${MAX_TAG_LENGTH} characters.`;
    }

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

    setCurInput = (event) => {
        let input = event.target.value;
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
        if(!errorMessage) {
            this.props.requestTagSuggestions(tag);
        }
        
        this.setState({
            curInput: input,
            inputError: errorMessage ? true : false,
            errorMessage: errorMessage
        });
    }

    handleBlur = () => {
        console.log("handlin' the blur.");
        this.addTag();
    }

    getNumUses = (tag) => {
        for (let i = 0; i < this.visibleSuggestion.length; i++) {
            if (this.visibleSuggestion[i].tag === tag) {
                return this.visibleSuggestion[i].numUses;
            }
        }
    }

    render() {
        const { suggestions, error } = this.props;
        console.log("suggestion");
        console.log(suggestions);

        this.visibleSuggestion = [];

        // if there is an active suggestion
        if (suggestions && this.state.curInput !== "") {
            // only show them if they match the current input
            for (let i = 0; i < suggestions.length; i++) {
                if (suggestions[i].tag.startsWith(this.state.curInput)) {
                    this.visibleSuggestion.push(suggestions[i]);
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
                        onChange={(event, newValue) => {
                            if (typeof newValue === 'string') {
                                console.log("String found")
                                this.setState({
                                    curInput: newValue
                                }, this.addTag)
                            }
                            else if (newValue && newValue.inputValue) {
                                console.log("wrapped")
                                this.setState({
                                    curInput: newValue.inputValue
                                }, this.addTag)
                            }
                            else {
                                console.log("????");
                            }
                            this.visibleSuggestion = [];
                        }}
                        value={this.state.curInput}
                        id="free-solo-demo"
                        freeSolo
                        options={this.visibleSuggestion.map((suggestion) => suggestion.tag)}
                        renderOption={suggestion => {
                            return (<span>
                                <Typography component="span">
                                    {suggestion}
                                </Typography>
                                <Typography component="span" variant="subtitle2">
                                    {` (${this.getNumUses(suggestion)})`}
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
                        {this.props.tags.map((tag, index) => (
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
    tags: PropTypes.array
};


export default withStyles(useStyles)(TagBox);