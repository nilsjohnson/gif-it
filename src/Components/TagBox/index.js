import React from 'react';
import './style.css';
import { Grid } from '@material-ui/core';

export function TagBox(props) {
    return (
        <div>
            <Grid item>
                <input
                    type="text"
                    placeholder="Enter Some Tags..."
                    onChange={props.setTags}
                />
            </Grid>
            <Grid item>
                <button onClick={props.share} > Tag it and Share! </button>
            </Grid>
        </div>
    );
}