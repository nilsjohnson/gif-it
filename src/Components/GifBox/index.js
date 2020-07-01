import React, { Component } from 'react';
import './style.css';

function GifBox(props) {
    return ( 
        <div>
            <img className="upload-result" src ={ props.servePath }/> 
            <div className="container">
                <input className="input-wide"
                    type = "text"
                    placeholder = "Enter Some Tags..."
                    onChange = { props.setTags }
                />  
            </div>  
            <div className="container">
                <button onClick = { props.share } > Tag it and Share! </button>  
            </div> 
        </div>
    );
}


export default GifBox;