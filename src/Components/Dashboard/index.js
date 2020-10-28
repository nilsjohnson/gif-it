import React, { Component } from "react";
import Header from "../Header";
import { Box, Grid, Button, Divider, withStyles, Typography } from "@material-ui/core";
import { Redirect } from 'react-router-dom'
import { checkToken, deleteAlbumById, deleteMediaById, getUserMedia } from '../../util/data';
import Footer from "../Footer";
import { Container } from "@material-ui/core";
import EditWell from './EditWell';


const useStyles = ((theme) => ({
    btnBox: {
        paddingTop: theme.spacing(1)
    },
    editWell: {
        backgroundColor: "white",
        borderRadius: theme.spacing(.5)
    }
}));

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            media: []
        };

    }

    componentDidMount = () => {
        checkToken().then(res => {
            if (!res.ok) {
                this.setState({ redirect: true });
            }
            else {
                getUserMedia().then(res => {
                    if (res.ok) {
                        res.json().then(resJson => {
                            console.log(resJson);
                            this.setState({ media: resJson });
                        }).catch(err => console.log(err));
                    }
                    else {
                        console.log(res);
                    }
                }).catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
    }

    removeMedia = (mId) => {
        let media = this.state.media;

        for (let i = 0; i < media.length; i++) {
            if (media[i].id === mId) {
                media.splice(i, 1);
                this.setState({
                    media: media
                });
            }
        }
    }

    removeAlbum = (aId) => {
        let media = this.state.media;

        for (let i = 0; i < media.length; i++) {
            if (media[i].albumId === aId) {
                media.splice(i, 1);
                this.setState({
                    media: media
                });
            }
        }
    }

    deleteItem = (itemId) => {
        console.log("dboard: " + itemId);
        deleteMediaById(itemId).then(res => {
            if (res.ok) {
                this.removeMedia(itemId);
            }
            else {
                console.log(res);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    deleteAlbum = (aId) => {
        console.log("dboard, alb: " + aId);

        deleteAlbumById(aId).then(res => {
            if (res.ok) {
                //alert("Album " + aId + " deleted");
                this.removeAlbum(aId);
            }
            else {
                console.log(res);
            }
        }).catch(err => console.log(err));
    }

    render() {
        const { classes } = this.props;

        if (this.state.redirect) {
            return (<Redirect to='/login' />)
        }




        return (
            <Box>
                <Header />
                <Container maxWidth='lg'>
                    {this.state.media.length > 0 ?
                        <Grid
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="center"
                            spacing={2}
                        >
                            {/* linkAddress, src, altText, description  */}
                            {this.state.media.map((media) => (
                                <Grid item xs={12} sm={6} md={4} key={media.id} >
                                    <EditWell
                                        media={media}
                                        deleteItem={this.deleteItem}
                                        deleteAlbum={this.deleteAlbum}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                        :
                        <Typography align="center" variant='h6'>You don't appear to have any media uploaded. Upload some media :)</Typography>
                    }
                </Container>
                <Footer />
            </Box>
        );
    }
}

export default withStyles(useStyles)(Dashboard);