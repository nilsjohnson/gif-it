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
                <p>Status: {this.props.conversionStatus || "Click Convert When Upload Completes."}</p>
                <div className="">
                    <button disabled={this.props.enableBtn ? false : true} onClick={this.props.convert}>Convert To Gif!</button>
                </div> 
            </div>
        );
    }
}



export default ConversionProgressBox;
