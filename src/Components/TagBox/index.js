import React from 'react';
import './style.css';

export function TagBox(props) {
    return (
        <div className="container">
            <div className="container">
                <input className="input-wide"
                    type="text"
                    placeholder="Enter Some Tags..."
                    onChange={props.setTags}
                />
            </div>
            <button onClick={props.share} > Tag it and Share! </button>
        </div>
    );
}