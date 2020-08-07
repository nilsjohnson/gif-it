import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Button, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Tag from './Tag'

const MAX_TAG_LENGTH = 32;

const useStyles = theme => ({
    tagContainer: {
        display: "flex",
        border: "2px solid " + theme.palette.primary.main,
        borderRadius: theme.spacing(1),
        padding: theme.spacing(1)
    },
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
            curInput: "",
            inputError: false
        });

        this.visibleSuggestion = [];
    }

    isValidTag = (tag) => {
        console.log(`testing tag '${tag}'`);
        let letters = /^[0-9a-zA-Z ]+$/;
        if (tag.match(letters) && tag.length <= MAX_TAG_LENGTH) {
            return true;
        }

        return false;
    }

    onEnterPressed = (event) => {
        if (event.keyCode === 13) {
            console.log("enter pressed");
            this.addTag();
        }
    }

    /*
    validates and adds a tag to the state
    */
    addTag = () => {
        // remove any 'hash tags' and make any spacing single
        // to avoid tags like 'cute   cat'
        let tag = this.makeTag(this.state.curInput);

        if (!this.isValidTag(tag)) {
            this.setState({
                inputError: true
            });
            return;
        }

        if (this.props.tags.includes(tag)) {
            console.log("This tag is already added.");
            this.setState({
                curInput: ""
            });
            return;
        }

        console.log("adding " + tag);

        this.setState({
            curInput: "",
            inputError: false
        });

        this.props.addTag(tag);
        this.visibleSuggestion = [];
    }

    removeTag = (tag) => {
        this.props.removeTag(tag);
    }

    makeTag = (input) => {
        // trim it
        let tag = input.trim();
        // remove a leading #
        if(tag.startsWith('#')) {
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

        console.log(`input: '${input}', tag: '${tag}'`);

        // if the input is empty or just a hashtag, we dont show an error
        if(input.trim() === '' || input.trim() === '#') {
            this.setState({
                curInput: input,
                inputError: inputError
            });
            return;
        }

        // if this isn't a valid tag
        if(!this.isValidTag(tag)) {
            // mark input error
            inputError = true;
            console.log('Tag invalid. Not requesting suggestions. Marking error.');
        }
        else {
            // otherwise look for suggestions to complete this tag
            console.log('Tag was valid. Requesting suggestions.');
            this.props.requestTagSuggestions(tag);
        }

        this.setState({
            curInput: input,
            inputError: inputError
        });
    }

    handleBlur = () => {
        console.log("handlin' the blur.");
        console.log(this.state.curInput);
        this.addTag();
    }

    getNumUses = (tag) => {
        for(let i = 0; i < this.visibleSuggestion.length; i++) {
            if(this.visibleSuggestion[i].tag === tag) {
                return this.visibleSuggestion[i].numUses;
            }
        }
    }

    render() {
        const { classes, suggestions, error } = this.props;
        console.log("suggestion");
        console.log(suggestions);
        
        this.visibleSuggestion = [];

        // if there is an active suggestion
        if (suggestions && this.state.curInput !== "") {
            // only show them if they match the current input
            for(let i = 0; i < suggestions.length; i++) {
                if(suggestions[i].tag.startsWith(this.state.curInput)) {
                    this.visibleSuggestion.push(suggestions[i]);
                }
            }
        }

        return (
            <Grid
                container item
                direction="column"
                justify="space-evenly"
                spacing={2}>
                <Grid item>
                    <TextField multiline fullWidth rows={3} label={"Please Enter Description"} variant="outlined" onChange={this.props.setDescription} />
                </Grid>

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
                            renderOption = {suggestion => {
                                return(<span>
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
                            {this.props.tags.map(elem => (
                                <Tag key={elem} tag={elem} removeTag={this.removeTag} />
                            ))}
                        </Grid>
                        <Grid item>
                                {(error ? error : "")}
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item container
                    direction="row"
                    justify="center"
                    alignItems="flex-start" >
                    <Button className={classes.btn} variant="contained" color="secondary" onClick={this.props.cancel} > Cancel </Button>
                    <Button className={classes.btn} variant="contained" color="primary" onClick={this.props.share} > Share! </Button>

                </Grid>
            </Grid>
        );
    }
}

TagBox.propTypes = {
    tags: PropTypes.array
};


export default withStyles(useStyles)(TagBox);