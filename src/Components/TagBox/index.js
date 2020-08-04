import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Button, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
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
    }

    isValid = (tag) => {
        console.log(`testing tag '${tag}'`);
        let letters = /^[0-9a-zA-Z ]+$/;
        if(tag.match(letters)) {
            return true;
        }

        return false;
    }

    onEnterPressed = (event) => {
        if(event.keyCode === 13) {
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

        if(!this.isValid(tag)) {
            this.setState({
                inputError: true
            });
            return;
        }

        if(this.props.tags.includes(tag)) {
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
    }

    removeTag = (tag) => {
        this.props.removeTag(tag);
    }

    setCurInput = (event) => {
        if(this.state.inputError) {
            this.setState({
                inputError: false
            });
        }
        console.log(event.target.value);
        this.setState({
            curInput: event.target.value
        });
    }

    render() {
        const { classes } = this.props;

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
                        {/* <Box className={`${this.state.inputError ? classes.error : ""} ${classes.tagContainer}`}>
                            <InputBase
                                onKeyDown={this.onEnterPressed}
                                onChange={this.setCurInput}
                                className={classes.tagInput}
                                placeholder="Enter Tags"
                                inputProps={{ 'aria-label': 'Enter Tags' }}
                                value={this.state.curInput}
                            />
                            <IconButton onClick={this.addTag} aria-label="Enter Tags">
                                <AddIcon />
                            </IconButton>
                        </Box> */}
                        <TextField fullWidth label={"Please Enter Tags"} variant="outlined" 
                        onChange={this.setCurInput}
                        onKeyDown={this.onEnterPressed}
                        value={this.state.curInput}
                        InputProps={{
                            endAdornment: (
                                <IconButton onClick={this.addTag} aria-label="Enter Tags">
                                <AddIcon />
                            </IconButton>
                            ),
                           }}
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
                                <Tag key={elem} tag={elem} removeTag={this.removeTag}/>
                           ))}

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