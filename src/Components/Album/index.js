import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, Box, Card } from '@material-ui/core/';
import { getAlbumById } from '../../util/data';
import MediaBox from '../MediaBox';
import { Redirect } from 'react-router';

const useStyles = theme => ({
    container: {
        backgroundColor: theme.palette.primary.light,
        padding: theme.spacing(2),
        border: `4px dashed ${theme.palette.secondary.light}`,
        marginTop: theme.spacing(2),
        width: '100%',
    },
    title: {
        marginBottom: theme.spacing(2)
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
            items: [],
            redirect: null
        };
    }

    removeMedia = (mId) => {

        let tmp = this.state.items;
        console.log(tmp);
        let index = tmp.findIndex(elem => elem.id === mId);
        console.log(`Splicing at index ${index}`);
        tmp.splice(index, 1);
        
        this.setState({
            items: tmp
        });
    }

    componentDidMount = () => {
        getAlbumById(this.props.albumId).then(res => {
            if(res.ok) {
                res.json().then(resJson => {
                    console.log(resJson);
                    this.setState(resJson);
                }).catch(err => console.log(`JSON err: ${err}`))
            }
            else if(res.status === 404) {
                console.log("redirect");
                this.setState({redirect: '/404'})
            }
            else {
                console.log(res);
            }
            
        }).catch(err => console.log(`fetch err. ${err}`));
    }

    render() {
        if(this.state.redirect) {
            return <Redirect to={this.state.redirect}/>
        }

        const { classes } = this.props;
        return (
            <React.Fragment>
                {this.state.title &&
                    <Box className={classes.title}>
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
                    {this.state.items.map((item) => (
                        <Grid className={classes.albumItem} item xs={12} sm={6} md={4} key={item.id}>
                            <MediaBox
                                media={item}
                                removeMedia={this.removeMedia}
                            />
                        </Grid>

                    ))}
                </Grid>
            </React.Fragment>
        );
    }
}

Album.propTypes = {
    albumId: PropTypes.string
}

export default withStyles(useStyles)(Album);
