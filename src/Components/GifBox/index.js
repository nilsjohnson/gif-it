import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles';
import { Card, Box, Grid, CardMedia, Typography } from '@material-ui/core/';
import { getGifById } from '../../util/data';
import { ShareBox } from './ShareBox';
import Tag from '../Tag/Tag';
import FullWidthDivider from '../FullWidthDivider';

const useStyles = theme => ({
    shareContainer: {
        width: '100%'
    }
});

/**
 * This component is what the users see when they watch a gif on 
 * the webapp. 
 */
class GifBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tags: {},
            descriptionLines: [],
            fileName: ""
        };
    }

    componentDidMount = () => {
        getGifById(this.props.gifId)
            .then(res => {
                if (res.ok) {
                    res.json().then(resJson => {
                        console.log(resJson);
                        this.setState({
                            tags: JSON.parse(resJson.tags),
                            fileName: resJson.fileName,
                            descriptionLines: resJson.descript.split('\n')
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
                <Box m={2}>
                    <Grid
                        container
                        direction="column"
                        justify="flex-start"
                        alignItems="flex-start"
                        spacing={2}>
                        <CardMedia
                            component="img"
                            alt="Cool Gif"
                            height="auto"
                            image={this.state.fileName}
                            title={"Cool Gif"}
                        />
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
                        <FullWidthDivider />

                        <Box m={2} className={classes.shareContainer}>
                            <ShareBox
                                fileName={this.state.fileName}
                                id={this.props.gifId}
                            />
                        </Box>

                    </Grid>
                </Box>
            </Card >
        );
    }
}

GifBox.propTypes = {
    gifId: PropTypes.string,
    gifSrc: PropTypes.string

}

export default withStyles(useStyles)(GifBox);