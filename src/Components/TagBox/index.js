import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Button, TextField, MenuItem, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Tag from './Tag'

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
    },
    error: {
        backgroundColor: theme.palette.error.main
    }
});

class TagBox extends Component {
    constructor(props) {
        super(props)

        this.state = ({
            //tags: [],
            curInput: "",
            inputError: false
        });

        this.visibleSuggestion;
    }

    isValid = (tag) => {
        console.log(`testing tag '${tag}'`);
        let letters = /^[0-9a-zA-Z ]+$/;
        if (tag.match(letters)) {
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
        let tag = this.state.curInput.replace(/#/g, '').trim();
        tag = tag.replace(/\s+/g, ' ');

        if (!this.isValid(tag)) {
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
            curInput: ""
        });

        this.props.addTag(tag);
        this.visibleSuggestion = [];
    }

    removeTag = (tag) => {
        this.props.removeTag(tag);
    }

    setCurInput = (event) => {
        // clear error if applicable
        if (this.state.inputError) {
            this.setState({
                inputError: false
            });
        }
        // set the input
        this.setState({
            curInput: event.target.value
        });

        console.log("here is the new value!");
        console.log(event.target.value);

        this.props.getSuggestedTags(event.target.value);
    }

    getNumUses = (tag) => {
        for(let i = 0; i < this.visibleSuggestion.length; i++) {
            if(this.visibleSuggestion[i].tag === tag) {
                return this.visibleSuggestion[i].numUses;
            }
        }
    }

    render() {
        const { classes, suggestion, error } = this.props;
        console.log("suggestion");
        console.log(suggestion);
        
        this.visibleSuggestion = [];

        // if there is an active suggestion
        if (suggestion && this.state.curInput != "") {
            // only show them if they match the current input
            for(let i = 0; i < suggestion.length; i++) {
                if(suggestion[i].tag.startsWith(this.state.curInput)) {
                    this.visibleSuggestion.push(suggestion[i]);
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
                    <Grid item xs={12} sm={12}>
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
                                    value={this.state.curInput}
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