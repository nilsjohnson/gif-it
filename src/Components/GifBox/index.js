import React from 'react';
import './style.css';

function GifBox(props) {
    return ( 
        <div className="">
            <img className="img-fluid" alt="a cool gif" src ={ props.servePath }/> 
        </div>
    );
}


export default GifBox;