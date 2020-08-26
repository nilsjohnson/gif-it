import React from "react";
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';
import { LinkCopyBox } from "./LinkCopyBox";


/**
 * This component is used to show links for the various ways to share a gif.
 */
export function ShareBox(props) {
    const { fileName, id } = props;

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
                text={`https://gif-it.io/explore?gid=${id}`}
            />
            <LinkCopyBox
                type="html"
                text={`<img src='https://gif-it.io/${fileName}'>`}
            />
            <LinkCopyBox
                type="just the gif"
                text={`https://gif-it.io/${fileName}`}
            />
        </Grid>

    );
}

ShareBox.prototypes = {
    id: PropTypes.string,
    fileName: PropTypes.string
};