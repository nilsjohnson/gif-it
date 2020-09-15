import React, { Component } from 'react';
import { doSignedS3Post, getPresignedPost } from '../../util/data';
class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            success: false,
            url: ""
        }
    }

    handleChange = (ev) => {
        this.setState({ success: false, url: "" });

    }
    // Perform the upload
    handleUpload = (ev) => {
        let file = this.uploadInput.files[0];
        // Split the filename to get the name and type
        let fileParts = this.uploadInput.files[0].name.split('.');
        let fileName = fileParts[0];
        let fileType = fileParts[1];

        let fileInfo = {
            fileName: fileName,
            fileType: fileType
        }

        getPresignedPost(fileInfo).then(res => {
            res.json().then(data => {
                console.log("we got json!");
                console.log(data);

                const formData = new FormData();
                //formData.append("contentType", file.type);
                Object.entries(data.fields).forEach(([k, v]) => {
                    console.log(`${k} : ${v}`);
                    formData.append(k, v);
                });
                formData.append("file", file);
                

                doSignedS3Post(data.url, formData).then(res => {
                    console.log(res);
                    res.text().then(text => {
                        console.log(text);
                    });
                }).catch(err => console.log(err));

            })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
    }


    render() {
        const Success_message = () => (
            <div style={{ padding: 50 }}>
                <h3 style={{ color: 'green' }}>SUCCESSFUL UPLOAD</h3>
                <a href={this.state.url}>Access the file here</a>
                <br />
            </div>
        )
        return (
            <div className="App">
                <center>
                    <h1>UPLOAD A FILE</h1>
                    {this.state.success ? <Success_message /> : null}
                    <input onChange={this.handleChange} ref={(ref) => { this.uploadInput = ref; }} type="file" />
                    <br />
                    <button onClick={this.handleUpload}>UPLOAD</button>
                </center>
            </div>
        );
    }
}
export default Test;