import React, { Component } from 'react';
import './style.css';
import { formatBytes } from '../../util/util';


class ConversionProgressBox extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount = () => {
        // this is to trigger automatic conversion,
        // since we dont have any options yet
        this.props.convert();
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
                {/* <div className="container">
                    <button onClick={this.props.convert}>Convert To Gif!</button>
                </div> */}
            </div>
        );
    }
}



export default ConversionProgressBox;

