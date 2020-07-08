import React, { Component } from 'react';
import './style.css';
import { formatBytes } from '../../util/util';


class ConversionProgressBox extends Component {
    constructor(props) {
        super(props)
    }

    convert = (event) => {
        console.log("convert button pressed");
    }

    render() {
        return (
            <div className=''>
                <p>File: {this.props.fileName}</p>
                <p>Size: {formatBytes(this.props.size)}</p>
                <p>Length: {this.props.videoLength} seconds</p>
                <p>Status: {this.props.conversionStatus}</p>
                <div className="">
                    <button onClick={this.props.convert}>Convert To Gif!</button>
                </div> 
            </div>
        );
    }
}



export default ConversionProgressBox;

