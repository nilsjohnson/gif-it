import React from "react";
import "./style.css"

export function DropBox(props) {
    return (
        <div id="drop-box"
            className={props.hovering ? "choosing-files" : ""}
            onDrop={props.onDrop}
            onDragOver={props.onDragOver}
            onDragLeave={props.onDragLeave}>
            <div className="v-box">
              <div className="v-box-item">
                  <p>Drag and Drop Files or</p>
                  <input type="file" multiple onChange={props.selectFilesUpload} />
                </div>
            </div>  
          </div>
    );
}
