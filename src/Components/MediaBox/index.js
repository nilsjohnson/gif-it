import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles';
import { Collapse, Card, Box, Grid, CardMedia, CardActions, Typography } from '@material-ui/core/';
import { addTags, deleteMediaById, deleteTags, getMediaById, updateMediaDescription } from '../../util/data';
import { ShareBox } from './ShareBox';
import Tag from '../Tag/Tag';
import FullWidthDivider from '../FullWidthDivider';
import IconButton from '@material-ui/core/IconButton';
import ShareIcon from '@material-ui/icons/Share';
import clsx from 'clsx';
import { Redirect } from 'react-router';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { readUserId } from '../../util/util';
import EnterDescription from '../Uploader/EnterDescription';
import TagInputBox from '../TagInputBox';

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
    editIcons: {
        marginRight: 'auto'
    },
    fullWidth: {
        width: '100%'
    }
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
            editMode: false,
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

    removeTag = (tag) => {
        console.log(tag);
        let tmp = this.state.media;
        delete tmp.tags[tag];

        this.setState({
            media: tmp
        });

        deleteTags(tmp.id, [tag]).then(res => {
            if (!res.ok) {
                console.log("Tag update success");
            }
            else {
                console.log("Tag update fail");
                console.log(res);
            }
        }).catch(err => console.log(err));
    }

    requestTagSuggestions = () => {
        console.log("req tag suggest");
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

    addTag = (tag) => {
        console.log(tag);
        let tmp = this.state.media;
        // TODO, get the number..
        tmp.tags[tag] = 1;

        this.setState({
            media: tmp
        });

        addTags(tmp.id, [tag]).then(res => {
            if (!res.ok) {
                console.log("Tag update success");
            }
            else {
                console.log("Tag update fail");
                console.log(res);
            }
        }).catch(err => console.log(err));
    }

    setNewDescription = (val) => {
        console.log(val);
        let tmp = this.state.media;
        tmp.description = val;

        this.setState({
            media: tmp
        });

        updateMediaDescription(tmp.id, val).then(res => {
            if (!res.ok) {
                console.log("Description update success");
            }
            else {
                console.log("Description update fail");
                console.log(res);
            }
        }).catch(err => console.log(err));
    }

    deleteMedia = () => {
        if (window.confirm(`Delete this item?`)) {
            deleteMediaById(this.state.media.id).then(res => {
                if (res.ok) {
                    if (this.props.removeMedia) {
                        this.props.removeMedia(this.state.media.id);
                    }
                    else {
                        console.log("media deleted, but no action defined for after.");
                    }

                }
                else {
                    console.log(res);
                }
            }).catch(err => {
                console.log(err);
            });
        }
        else {
            return;
        }
    }

    toggleEditMode = (ev) => {
        console.log("toggle edit");

        this.setState({
            editMode: !this.state.editMode
        });
    }

    componentDidMount = () => {
        // if there is no mediaId prop, this because the media
        // item was passed as a prop, so we dont need to fetch it.
        if (!this.props.mId) {
            return;
        }
        console.log("fettching");
        getMediaById(this.props.mId)
            .then(res => {
                console.log(res);
                if (res.ok) {
                    res.json().then(resJson => {
                        // set null values to empty for rendering
                        console.log(resJson);
                        if (!resJson.tags) {
                            resJson.tags = {}
                        }
                        if (!resJson.description) {
                            resJson.description = ''
                        }

                        this.setState({
                            media: resJson
                        });
                    })
                }
                else if (res.status === 404) {
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
        if (this.state.redirect) {
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



                        <Grid item className={classes.fullWidth}>
                            {!this.state.editMode ? descriptionLines.map((line, index) =>
                                <Typography key={index}>
                                    {line}
                                </Typography>
                            ) :
                                <Grid item container
                                    direction='row'
                                    justify="flex-start"
                                    alignItems="flex-start"
                                    spacing={2}
                                >
                                    <Grid item xs={12}>
                                        <Box p={2}>
                                            <EnterDescription
                                                initialText={this.state.media.description}
                                                setDescription={this.setNewDescription}
                                            />
                                            <TagInputBox
                                                suggestions={[]}
                                                tags={Object.keys(this.state.media.tags)}
                                                addTag={this.addTag}
                                                removeTag={this.removeTag}
                                                requestTagSuggestions={this.requestTagSuggestions}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>}
                        </Grid>

                        {description.length > 1 ? <FullWidthDivider /> : ""}
                        {!this.state.editMode &&
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
                        }


                        <FullWidthDivider gutterBottom />
                    </Grid>
                    <CardActions disableSpacing={true}>
                        {readUserId() === this.state.media.ownerId &&
                            <div className={classes.editIcons}>
                                <IconButton
                                    onClick={this.deleteMedia}
                                >
                                    <DeleteIcon />
                                </IconButton>

                                <IconButton
                                    onClick={this.toggleEditMode}
                                >
                                    <EditIcon />
                                </IconButton>
                            </div>
                        }

                        <IconButton
                            className={clsx(classes.expand, {
                                [classes.expandOpen]: this.state.shareExpanded,
                            })}
                            onClick={this.handleExpandClick}
                            aria-expanded={this.state.shareExpanded}
                            aria-label="share"
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