import React from "react";
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';
import LinkCopyBox from "./LinkCopyBox";


/**
 * This component is used to show links for the various ways to share a gif.
 */
export function ShareBox(props) {
    const { fileName, link } = props;

    return (
        <Grid
            item container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
        >
            <LinkCopyBox
                type="on gif-it"
                text={`https://gif-it.io${link}`}
            />
            <LinkCopyBox
                type="html"
                text={`<img src='https://gif-it.io/${fileName}'>`}
            />
            <LinkCopyBox
                type="just the file"
                text={`https://gif-it.io/${fileName}`}
            />
        </Grid>

    );
}

ShareBox.prototypes = {
    link: PropTypes.string,
    fileName: PropTypes.string
};

