import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles';
import { Container, Typography, Grid, Box, Card } from '@material-ui/core/';
import { getAlbumById } from '../../util/data';
import MediaBox from '../MediaBox';

const useStyles = theme => ({
    root: {
        // width: '500px',
        // height: '250px'
    },
    container: {
        backgroundColor: theme.palette.primary.light,
        padding: theme.spacing(2),
        border: `4px dashed ${theme.palette.secondary.light}`,
        marginTop: theme.spacing(2),
        width: '100%',
    },
    subContainer: {
        backgroundColor: "white",
        borderRadius: theme.spacing(1)
    },
    droppingFiles: {
        opacity: .5
    },
    btn: {
        margin: theme.spacing(2)
    },
    inputContainer: {
        height: '200px',
        background: 'linear-gradient(100deg, rgba(25,209,146,0.5746673669467788) 0%, rgba(15,95,209,0.6222864145658263) 100%)'
    },
    imgResponsive: {
        width: '100%'
    },
    albumItem: {
        minWidth: '375px'
    }
});

/**
 * This component is what the users see when they watch a gif on 
 * the webapp. 
 */
class Album extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "",
            description: "",
            ownerId: null,
            items: []
        };
    }

    componentDidMount = () => {
        console.log(this.props.albumId);
        getAlbumById(this.props.albumId).then(res => {
            res.json().then(resJson => {
                console.log(resJson);
                this.setState(resJson);
            }).catch(err => console.log(`JSON err: ${err}`))
        }).catch(err => console.log(`fetch err. ${err}`));
    }

    render() {
        const { classes } = this.props;
        return (
            <Container component='main' maxWidth="lg" >
                {this.state.title &&
                    <Box p={3}>
                        <Card>
                            <Typography align="center" variant="h4">
                                {this.state.title}
                            </Typography>
                        </Card>
                    </Box>
                }

                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    {this.state.items.map((item, index) => (
                        <Grid className={classes.albumItem} item xs key={index}>
                            <MediaBox
                                key={index}
                                tags={item.tags}
                                description={item.description}
                                fileName={item.fileName}
                                fullSizeName={item.fullSizeName}
                                mId={item.id}
                            />
                        </Grid>

                    ))}
                </Grid>
            </Container>
        );
    }
}

Album.propTypes = {
    albumId: PropTypes.string
}

export default withStyles(useStyles)(Album);
