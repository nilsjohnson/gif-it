import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Card, Box, Grid, CardMedia } from '@material-ui/core/';
import { getGifById } from '../../util/data';

const useStyles = theme => ({
    tag: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1)
    }

});

class GifBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tags: [],
            description: ""
        };

    }

    componentDidMount = () => {
        getGifById(this.props.gifId)
        .then(res => {
            if(res.ok) {
                res.json().then(resJson => {
                    console.log(resJson);
                    this.setState({
                        tags: JSON.parse(resJson.tags),
                        description: resJson.descript
                    });
                })
            }
            else {
                console.log(res);
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        const { classes } = this.props;
        return (
            <Box m={2}>
                <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="center"
                >
                    <Card>
                        <Grid item>
                            <Box p={1}>
                                <CardMedia
                                    component="img"
                                    alt="Cool Gif"
                                    height="auto"
                                    image={this.props.gifId+".gif"}
                                    title={"Cool Gif"}
                                />
                            </Box>
    
                        </Grid>
                        <Box p={1}>
                            <Grid item>
                                <p>{this.state.description}</p>
                                <Grid
                                    container item
                                    direction="row"
                                    justify="center"
                                    alignItems="center"
                                >
                                    {this.state.tags.map(tag =>
                                        <h4 key={tag} className={classes.tag}>{tag}</h4>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>
            </Box>
        );
    }
}

export default withStyles(useStyles)(GifBox);