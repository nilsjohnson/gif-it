import React from 'react';
import './style.css';

export function TagBox(props) {
    return (
        <div className="v-box">
            <div className="">
                <input
                    type="text"
                    placeholder="Enter Some Tags..."
                    onChange={props.setTags}
                />
            </div>
            <div className="button-box">
                <button onClick={props.share} > Tag it and Share! </button>
            </div>
            
        </div>
    );
}