import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import { withStyles } from '@material-ui/core';

const useStyles = theme => ({
    card: {
        display: 'flex',
    },
    cardDetails: {
        flex: 1,
    },
    cardMedia: {
        width: 300,
        height: 300
    }
});

class BlogThumbnail extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { classes, post } = this.props;
        console.log(post.images[0]);

        return (
            <Grid item container>
                <Grid item xs={false} sm={1}></Grid>
                <Grid item xs={12} sm={10}>
                    <CardActionArea component="a" href={`/blog?p=${post.id}`}>
                        <Card className={classes.card}>
                            <div className={classes.cardDetails}>
                                <CardContent>
                                    <Typography component="h2" variant="h5">
                                        {post.title}
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        {post.updated}
                                    </Typography>
                                </CardContent>
                            </div>

                            <CardMedia className={classes.cardMedia}
                                image={post.images[0].url}
                                title={"titleee"} />

                        </Card>
                    </CardActionArea>
                </Grid>
                <Grid item xs={false} sm={1}></Grid>
            </Grid>
        );
    }
}

BlogThumbnail.propTypes = {
    post: PropTypes.object,
};

export default withStyles(useStyles)(BlogThumbnail);