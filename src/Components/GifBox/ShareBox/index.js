import React from "react";
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';
import { LinkCopyBox } from "./LinkCopyBox";


/**
 * This component is used to show links for the various ways to share a gif.
 */
export function ShareBox(props) {
    return (
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="stretch"
                spacing={2}
            >
                <LinkCopyBox
                    type="on gif-it"
                    text={`https://gif-it.io/explore?gid=${props.id}`}
                />
                <LinkCopyBox
                    type="html"
                    text={`<img src='https://gif-it.io/${props.src}'>`}
                />
                <LinkCopyBox
                    type="just the gif"
                    text={`https://gif-it.io/${props.src}`}
                />
            </Grid>

    );
}

ShareBox.prototypes = {
    id: PropTypes.string,
    src: PropTypes.string
};