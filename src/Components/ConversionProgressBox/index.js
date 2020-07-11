import React, { Component } from 'react';
import './style.css';
import { formatBytes } from '../../util/util';


class ConversionProgressBox extends Component {
    constructor(props) {
        super(props)

        this.state = {
            convertClicked: false
        };
    }

    convert = (event) => {
        console.log("convert button pressed");
        this.setState({
            convertClicked: true
        });

        this.props.convert();
    }

    render() {
        return (
            <div className=''>
                <p>Status: {this.props.conversionStatus || "Click Convert When Upload Completes."}</p>
                <div className="">
                    <button disabled={this.state.convertClicked || !this.props.enableBtn } onClick={this.convert}>Convert To Gif!</button>
                </div> 
            </div>
        );
    }
}



export default ConversionProgressBox;
