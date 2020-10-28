import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles';
import { Collapse, Card, Box, Grid, CardMedia, CardActions, Typography } from '@material-ui/core/';
import { getMediaById } from '../../util/data';
import { ShareBox } from './ShareBox';
import Tag from '../Tag/Tag';
import FullWidthDivider from '../FullWidthDivider';
import IconButton from '@material-ui/core/IconButton';
import ShareIcon from '@material-ui/icons/Share';
import clsx from 'clsx';
import { Redirect } from 'react-router';

const useStyles = theme => ({
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
});

/**
 * This component is what the users see when they watch a gif on 
 * the webapp. 
 */
class MediaBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            media: this.props.media ? this.props.media : {},
            shareExpanded: false,
            redirect: null
        };
    }

    setShareExpanded = (val) => {
        this.setState({
            shareExpanded: val
        });
    }

    handleExpandClick = () => {
        this.setShareExpanded(!this.state.shareExpanded);
    }

    getShareBox = () => {
        const { media } = this.state;
        console.log("state");
        console.log(this.state);
        let links = [];

        links.push({
            title: "on gif-it.io",
            link: `https://gif-it.io/explore?mId=${media.id}`
        });

        if (media.fullSizeName) {
            links.push({
                title: "full resolution",
                link: `https://gif-it.io/${media.fullSizeName}`
            });
        }

        return (
            <ShareBox
                links={links}
            />
        );
    }

    splitLines = (str) => {
        if (str) {
            return str.split('\n');
        }
        return [];
    }

    componentDidMount = () => {
        // if there is no mediaId prop, this because the media
        // item was passed as a prop, so we dont need to fetch it.
        if (!this.props.mId) {
            return;
        }

        getMediaById(this.props.mId)
            .then(res => {
                if (res.ok) {
                    res.json().then(resJson => {
                        // set null values to empty for rendering
                        if(!resJson.tags) {
                            resJson.tags = {}
                        }
                        if(!resJson.description) {
                            resJson.description = ''
                        }

                        this.setState({
                            media: resJson
                        });
                    })
                }
                else if(res.status === 404) {
                    console.log("its a 404!");
                    this.setState({
                        redirect: '/404'
                    });
                }
                else {
                    console.log(`Problem fetching gif by id: ${res}`);
                }
            })
            .catch(err => console.log(err));
    }

    render() {
        if(this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        const { classes } = this.props;
        const { media = {} } = this.state;
        const { description = "", fullSizeName = "", fileName = "", tags = {} } = media;
        let descriptionLines = description ? description.split('\n') : [];

        return (
            <Card>
                <Box m={1}>
                    <Grid
                        container
                        direction="column"
                        justify="flex-start"
                        alignItems="flex-start"
                    >
                        {fullSizeName ?
                            <a href={`https://gif-it.io/${fullSizeName}`}
                                className={classes.fullWidth}
                            >
                                <CardMedia
                                    component="img"
                                    alt="Cool Gif"
                                    height="auto"
                                    image={fileName}
                                    title={descriptionLines[0]}
                                />
                            </a>
                            :
                            <CardMedia
                                component="img"
                                alt="Cool Gif"
                                height="auto"
                                image={fileName}
                                title={descriptionLines[0]}
                            />}

                        <Grid item>
                            <Grid
                                container item
                                direction="row"
                                justify="flex-start"
                                alignItems="flex-start"
                            >
                                {Object.keys(tags).map((key, index) =>
                                    <Tag key={index} tag={key} count={tags[key]} explorable={true} />
                                )}
                            </Grid>
                        </Grid>

                        {description.length > 1 ? <FullWidthDivider /> : ""}
                        <Grid item>
                            {descriptionLines.map((line, index) =>
                                <Typography key={index}>
                                    {line}
                                </Typography>
                            )}
                        </Grid>

                        <FullWidthDivider gutterBottom />
                    </Grid>
                    <CardActions disableSpacing={true}>
                            <IconButton
                                className={clsx(classes.expand, {
                                    [classes.expandOpen]: this.state.shareExpanded,
                                })}
                                onClick={this.handleExpandClick}
                                aria-expanded={this.state.shareExpanded}
                                aria-label="show more"
                            >
                                <ShareIcon />
                            </IconButton>
                        </CardActions>
                        <Collapse in={this.state.shareExpanded} timeout="auto" unmountOnExit>
                            <Box p={1}>
                                {this.getShareBox()}
                            </Box>
                        </Collapse>
                </Box>
            </Card >
        );
    }
}

MediaBox.propTypes = {
    mId: PropTypes.string,
    media: PropTypes.object
}

export default withStyles(useStyles)(MediaBox);