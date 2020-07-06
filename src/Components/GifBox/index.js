import React, { Component } from 'react';
import './style.css';

function GifBox(props) {
    return ( 
        <div className="">
            <img className="img-fluid" src ={ props.servePath }/> 
        </div>
    );
}


export default GifBox;