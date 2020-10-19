import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles';
import { Card, Box, Grid, CardMedia, Typography, Container } from '@material-ui/core/';
import { getMediaById } from '../../util/data';
import { ShareBox } from './ShareBox';
import Tag from '../Tag/Tag';
import FullWidthDivider from '../FullWidthDivider';
import { Link } from 'react-router-dom';

const useStyles = theme => ({
    fullWidth: {

    },
    root: {
        // paddingBottom: theme.spacing(2)
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
            tags: this.props.tags ? this.props.tags : [],
            descriptionLines: this.props.description ? this.splitLines(this.props.description) : [],
            fileName: this.props.fileName ? this.props.fileName : "",
            fullSizeName: this.props.fullSizeName ? this.props.fullSizeName : ""
        };
    }

    splitLines = (str) => {
        if (str) {
            return str.split('\n');
        }
        return [];
    }

    componentDidMount = () => {
        if (!this.props.mId) {
            return;
        }
        getMediaById(this.props.mId)
            .then(res => {
                if (res.ok) {
                    res.json().then(resJson => {
                        this.setState({
                            tags: resJson.tags,
                            fileName: resJson.fileName,
                            descriptionLines: resJson.descript ? resJson.descript.split('\n') : [],
                            fullSizeName: resJson.fullSizeName
                        });
                    })
                }
                else {
                    console.log(`Problem fetching gif by id: ${res}`);
                }
            })
            .catch(err => console.log(err));
    }

    render() {
        const { classes } = this.props;

        return (
            <Card>
                <Box m={1}>
                    <Grid
                        container
                        direction="column"
                        justify="flex-start"
                        alignItems="flex-start"
                    >
                        {this.state.fullSizeName ?
                            <a href={`https://gif-it.io/${this.state.fullSizeName}`}
                                className={classes.fullWidth}
                            >
                                <CardMedia
                                    component="img"
                                    alt="Cool Gif"
                                    height="auto"
                                    image={this.state.fileName}
                                    title={this.state.descriptionLines[0]}
                                />
                            </a>
                            :
                            <CardMedia
                                component="img"
                                alt="Cool Gif"
                                height="auto"
                                image={this.state.fileName}
                                title={this.state.descriptionLines[0]}
                            />}

                        <Grid item>
                            <Grid
                                container item
                                direction="row"
                                justify="flex-start"
                                alignItems="flex-start"
                            >
                                {Object.keys(this.state.tags).map((key, index) =>
                                    <Tag key={index} tag={key} count={this.state.tags[key]} explorable={true} />
                                )}
                            </Grid>
                        </Grid>

                        {this.state.descriptionLines.length > 1 ? <FullWidthDivider /> : ""}
                        <Grid item>
                            {this.state.descriptionLines.map((line, index) =>
                                <Typography key={index}>
                                    {line}
                                </Typography>
                            )}
                        </Grid>
                        
                        <FullWidthDivider gutterBottom />    
                        <ShareBox
                            fileName={this.state.fileName}
                            id={this.props.mId}
                        />

                    </Grid>
                </Box>
            </Card >
        );
    }
}

MediaBox.propTypes = {
    mId: PropTypes.string,
}

export default withStyles(useStyles)(MediaBox);