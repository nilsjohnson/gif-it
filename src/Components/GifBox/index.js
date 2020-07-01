import React, { Component } from 'react';
import './style.css';
import { TagBox } from '../TagBox';

function GifBox(props) {
    return ( 
        <div className="gif-box">
            <img className="upload-result" src ={ props.servePath }/> 
        </div>
    );
}


export default GifBox;