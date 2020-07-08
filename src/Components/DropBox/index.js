import React from "react";
import "./style.css"
import { Grid, Box } from '@material-ui/core'

export function DropBox(props) {
    return (
        <Grid container
          direction="column"
          justify="center"
          alignItems="center"
          className={props.hovering ? "choosing-files" : ""}
          onDrop={props.onDrop}
          onDragOver={props.onDragOver}
          onDragLeave={props.onDragLeave}
          id="drop-box"
        >
        
        <p>Drag and Drop Files or</p>
        <input id="file-input" type="file" multiple onChange={props.selectFilesUpload} />
           
        </Grid>
    );
}
