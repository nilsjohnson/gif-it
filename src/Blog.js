import React, { Component } from "react";
import { Container, Box, Grid, withStyles, Typography } from '@material-ui/core';
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { getLatest, getPostById } from './util/blogData.js';
import BlogThumbnail from "./Components/Blog/BlogThumbnail";

const useStyles = theme => ({
    container: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    postContainer: {
        backgroundColor: "white",
        paddingLeft: theme.spacing(6),
        margin: theme.spacing(2)
    }
});

class Blog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            posts: [],
            post: null
        };
    }

    /**
 * Checks the window for a media id 
 * @return the gif id if present otherwise null
 */
    getPostParam = () => {
        let url = new URL(window.location.href);
        return url.searchParams.get("p");
    }

    componentDidMount = () => {
        let postId = this.getPostParam();
        console.log(postId);

        if (postId) {
            getPostById(postId).then(res => {
                console.log(res);
                if (res.ok) {
                    res.json().then(resJson => {
                        console.log(resJson);
                        this.setState({
                            post: resJson
                        });
                    }).catch(err => console.log(res));
                }
                else {
                    console.log("res not ok");
                    console.log(res);
                }
            }).catch(err => {
                console.log(err);
            })
        }
        else {
            getLatest().then(res => {
                console.log(res);
                if (res.ok) {
                    console.log("res ok");
                    res.json().then(resJson => {
                        console.log(resJson);
                        this.setState({
                            posts: resJson.items
                        });
                    }).catch(err => console.log(err));
                }
                else {
                    console.log("err: ");
                    console.log(res);
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <Header />
                <Container disableGutters={true}>
                    <Box className={classes.container}>
                        <Grid
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="flex-start"
                            spacing={2}

                        >

                            {this.state.post
                                ?
                                <Grid item className={classes.postContainer}>
                                    <Typography gutterBottom component="h1" variant="h4" align="center">
                                        {this.state.post.title}
                                    </Typography>
                                    <Box p={1}>
                                        <div dangerouslySetInnerHTML={{ __html: this.state.post.content }}></div>
                                    </Box>
                                </Grid>
                                :
                                this.state.posts.map((post, i) => (
                                    <BlogThumbnail key={i}
                                        post={post}
                                    />
                                ))
                            }
                        </Grid>
                    </Box>
                </Container>
                <Footer />
            </div>
        );
    }
}

export default withStyles(useStyles)(Blog);