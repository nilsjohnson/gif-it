import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { DropBox } from "../DropBox";
import { Typography } from "@material-ui/core";

class ImageUploader extends Component {
    constructor(props) {
        super(props);
        
        this.state = {

        };
    }

    render() {
        return (
            <div>
                <Typography align="center" variant='h6'>Upload Photos</Typography>
                <DropBox/>
            </div>
        );
    }
}

export default ImageUploader;