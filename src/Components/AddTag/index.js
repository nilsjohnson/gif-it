import React, { Component } from 'react';
import { withStyles } from '@material-ui/styles';

const styles = (theme) => ({
    tag: {
        cursor: "pointer",
        fontWeight: "bold",
        color: theme.palette.secondary.dark
    }
});

class AddTag extends Component {
    constructor(props) {
        super(props);
    }

    addTag = () => {
        this.props.addTagToSearch(this.props.tag);
    }

    render() {
        const { tag, classes } = this.props;
        return (
            <span onClick={this.addTag} className={classes.tag}>{tag}</span>
        );
    }
}

export default withStyles(styles)(AddTag);