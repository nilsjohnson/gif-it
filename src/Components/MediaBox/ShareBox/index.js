import React from "react";
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';
import LinkCopyBox from "./LinkCopyBox";


/**
 * This component is used to show links for the various ways to share a gif.
 */
export function ShareBox(props) {
    const { links = [] } = props;

    return (
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
        >
            {links.map((elem, index) => (
                <LinkCopyBox
                    key={index}
                    type={elem.title}
                    text={elem.link}
                />
            ))}
        </Grid>

    );
}

ShareBox.prototypes = {
    link: PropTypes.string,
    fileName: PropTypes.string
};

