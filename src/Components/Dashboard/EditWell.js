import React, { Component } from 'react';
import { Box, Grid, Button, Divider, withStyles } from "@material-ui/core";
import MediaCard from '../MediaCard';

const useStyles = ((theme) => ({
    btnBox: {
        paddingTop: theme.spacing(1)
    },
    editWell: {
        backgroundColor: "white",
        borderRadius: theme.spacing(.5)
    }
}));

class EditBox extends Component {
    constructor(props) {
        super(props);

    }

    delete = (event) => {
        const { media } = this.props;
        if (media.albumId) {
            /* glbal confirm */
            if (window.confirm(`Delete ${media.albumTitle ? `"${media.albumTitle}"` : 'album'}?`)) {
                console.log("deleting album " + media.albumId);
                this.props.deleteAlbum(media.albumId);
            }
            else {
                return;
            }

        }
        else {
            if (window.confirm("Delete this item?")) {
                console.log("deleting single item " + media.id);
                this.props.deleteItem(media.id);
            }

        }
    }

    render() {
        const { media, classes } = this.props;

        return (
            <Box className={classes.editWell}>
                <MediaCard
                    key={media.id}
                    media={media}
                    showUser={false}
                />
                <Grid
                    container className={classes.btnBox}
                    direction="row"
                    justify="center"
                    alignItems="center"
                    spacing={3}
                >
                    {/* <Grid item>
                        <Button color="secondary" variant='contained'>
                            Edit
                        </Button>
                    </Grid> */}
                    <Grid item>
                        <Button onClick={this.delete} color="primary" variant='contained'>
                            Delete
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}

export default withStyles(useStyles)(EditBox)