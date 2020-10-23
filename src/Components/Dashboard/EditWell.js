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
        
        if(media.albumId) {
            console.log("deleting album " + media.albumId);
            this.props.deleteAlbum(media.albumId);
        }
        else {
            console.log("deleting single item " + media.id);
            this.props.deleteItem(media.id);
        }
    }

    render() {
        const { media, classes } = this.props;

        return (
            <Box className={classes.editWell}>
                <MediaCard
                    key={media.id}
                    src={media.thumbName}
                    description={media.albumId ? media.AlbumTitle : media.descript}
                    linkAddress={media.albumId ? `/explore?albumId=${media.albumId}` : `/explore?mId=${media.id}`}
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