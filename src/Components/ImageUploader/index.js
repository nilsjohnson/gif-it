import React from "react";
import { Typography, Container, Grid, Box, TextField, Button } from "@material-ui/core";
import UploaderBase from "../UploaderBase";
import { withStyles } from '@material-ui/core/styles';
import Upload from "./Upload";
import TagInputBox from '../TagInputBox';
import { getPresignedPost, doSignedS3Post, postPhotoGallery } from '../../util/data';
import { formatBytes } from '../../util/util';

const INPUT_ID = "img-uploader-input";
const PROGRESS_BAR_UPDATE_INTERVAL = 250; // milliseconds

const useStyles = theme => ({
    root: {
        // width: '500px',
        // height: '250px'
    },
    container: {
        backgroundColor: theme.palette.primary.light,
        padding: theme.spacing(2),
        border: `4px dashed ${theme.palette.secondary.light}`,
        marginTop: theme.spacing(2),
        width: '100%',
    },
    subContainer: {
        backgroundColor: "white",
        borderRadius: theme.spacing(1)
    },
    droppingFiles: {
        opacity: .5
    },
    btn: {
        margin: theme.spacing(2)
    },
    inputContainer: {
        height: '200px',
        background: 'linear-gradient(100deg, rgba(25,209,146,0.5746673669467788) 0%, rgba(15,95,209,0.6222864145658263) 100%)'
    }
});


class ImageUploader extends UploaderBase {
    constructor(props) {
        super(props);

        this.setAllowedMimeTypes(['image/*']);
        this.setMaxNumUploads(1000);
        this.setInputElementId(INPUT_ID);
        this.setMaxUploadSize(70);
        this.cv = null;
        this.estimatedUploadRate = 500;
    }

    cancel = () => {
        console.log("cancel clicked");
    }

    addTag = (upload, tag) => {
        let tags;
        if (upload.tags) {
            tags = upload.tags;
            tags.push(tag);
        }
        else {
            tags = [tag];
        }

        this.updateUploads(upload.uploadId, { tags: tags })
    }



    setDescription = (upload, description) => {
        this.updateUploads(upload.uploadId, { description: description });
    }

    removeTag = (upload, tag) => {
        if (upload.tags) {
            let tmp = upload.tags;
            let index = tmp.findIndex(elem => elem === tag);
            tmp.splice(index, 1);
            this.updateUploads(upload.uploadId, { tags: tmp })
        }
        else {
            console.log(`Tried to remove tag ${tag} but it wasn't found.`);
        }
    }

    share = () => {
        console.log(this.state.uploads);

        let album = {
            albumTitle: this.state.albumDescription,
            photos: []
        };
      
        
        for (let i = 0; i < this.state.uploads.length; i++) {
            let curUpload = this.state.uploads[i];
            let photo = {
                uploadId: curUpload.uploadId,
                description: curUpload.description,
                fileName: curUpload.fileName,
                tags: curUpload.tags,
                thumbFileName: curUpload.thumbName,
                originalFileName: curUpload.file.name
            };

            album.photos.push(photo);
        };

        postPhotoGallery(album).then(res => {
            if (res.ok) {
                console.log("ok!");
            }
        }).catch(err => console.log(err))


    }

    componentDidMount = () => {
        this.setInitalSpeed();
        
        const script = document.createElement("script");
        script.src = './opencv4.4.js';
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => {
            console.log("CV loaded.");
            this.setState({
                cvLoaded: true
            });
        }
    }

    createForm = (fields, file) => {
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => {
            //console.log(`${k} : ${v}`);
            formData.append(k, v);
        });
        formData.append("file", file);
        return formData;
    }

    /**
     * Uploads a dummy file to s3 to guess our upload speed.
     */
    setInitalSpeed = () => {
        let hello = [90000];
        for (let i = 0; i < 90000; i++) {
            hello[i] = i;
        }
        let curFile = new Blob(hello, { type: 'text/plain' });

        let info = {
            fileName: "testFile",
            fileType: "txt",
            action: "speed_test"
        };

        let startTime = new Date().getTime();
        getPresignedPost(info).then(res => {
            res.json().then(data => {
                if (!res.ok) {
                    console.log("Problem getting presignedPost fields for initial speed test");
                    return;
                }
                console.log("creating form for speed test");
                const formData = this.createForm(data.fields, curFile);

                doSignedS3Post(data.url, formData).then(res => {
                    if (res.ok) {
                        let endTime = new Date().getTime();
                        this.setUploadRate(startTime, endTime, curFile.size);
                        console.log("upload rate is: " + this.estimatedUploadRate + "/" + PROGRESS_BAR_UPDATE_INTERVAL + "ms");
                        return;
                    }
                    console.log("Problem doing presigned post.");
                    console.log(res);
                    res.text().then(text => {
                        console.log(text);
                    });
                }).catch(err => console.log(err));

            })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
    }

    /**
     * A recursive method to update the progress bar of an upload
     * @param {*} totalUploaded the amount of data that has been uploaded
     * @param {*} upload the upload being uploaded
     * @param {*} fileSize the size of the file being uploaded
     */
    doProgressBar = (upload, fileSize, rate, totalUploaded = 0) => {
        setTimeout(() => {
            if (totalUploaded >= fileSize) {
                return;
            }

            totalUploaded += rate
            let percent = Math.round(totalUploaded / fileSize * 100);
            percent = percent < 100 ? percent : 100;

            if (upload.status === 'uploading') {
                this.updateUploads(upload.uploadId, { percentUploaded: percent });
                this.doProgressBar(upload, fileSize, rate, totalUploaded);
            }
            else {
                this.updateUploads(upload.uploadId, { percentUploaded: 100 });
                return;
            }
        }, PROGRESS_BAR_UPDATE_INTERVAL);
    }

    setAlbumTitle = (event) => {
        let val = event.target.value;
        this.setState({
            albumDescription: val
        });
    }

    setUploadRate = (startTime, endTime, fileSize) => {
        this.estimatedUploadRate = fileSize * PROGRESS_BAR_UPDATE_INTERVAL / (endTime - startTime);
    }

    uploadThumbnail = () => {
        if (this.curFileNum >= this.uploads.length) {
            return;
        }
        console.log(`Starting upload at index ${this.curFileNum}`);

        let curFile = this.uploads[this.curFileNum].file;
        let curThumbFile = this.uploads[this.curFileNum].thumbfile;
        let tempUploadId = this.uploads[this.curFileNum].uploadId;
        let fileSize = curFile.size;


        if (curFile.size / (1000 * 1000) > this.maxUploadSize) {
            this.setError(this.curFileNum, `File Must Not Exceed ${formatBytes(this.maxUploadSize * 1000 * 1000)}`);
            this.curFileNum++;
            return this.upload();
        }

        if (!this.isValidType(curFile.type)) {
            this.setError(this.curFileNum, `File must be of type {${this.allowedMimeTypes}}. '${curFile.type}' was provided`);
            this.curFileNum++;
            return this.upload();
        }

        let fileParts = curFile.name.split('.');

        let fileInfo = {
            fileName: fileParts[0],
            fileType: fileParts[1],
            action: "photo"
        };

        let startTime = new Date().getTime();
        getPresignedPost(fileInfo).then(res => {
            if (res.ok) {
                res.json().then(data => {
                    console.log(data);
                    const { photoData = {}, thumbData = {}, uploadId } = data;
                    console.log(photoData);
                    const photoFormData = this.createForm(photoData.fields, curFile);
                    console.log("ok2");
                    this.updateUploads(tempUploadId, { uploadId: uploadId, fileName: photoData.fields.key, thumbName: thumbData.fields.key });
                    console.log("ok3");
                    // starts the progress bar rolling...
                    this.doProgressBar(this.uploads[this.curFileNum], fileSize, this.state.estimatedUploadRate);
                    // upload photo to s3
                    doSignedS3Post(photoData.url, photoFormData).then(res => {
                        if (res.ok) {
                            let endTime = new Date().getTime();
                            this.setUploadRate(endTime, startTime, fileSize);
                            this.updateUploads(uploadId, { status: 'editing' });
                            console.log("file uploaded to s3!");
                        }
                        else {
                            console.log("File could not be uploaded to s3.");
                            this.updateUploads(uploadId, { err: "File couldnt be uploaded." });
                            res.text().then(text => {
                                console.log(text);
                            });
                        }
                        this.curFileNum++;
                        return this.upload();

                    }).catch(err => {
                        console.log("Problem doing signed s3 post: " + err);
                        this.curFileNum++;
                        return this.upload();
                    });
                    // upload thumbnail to s3
                    const thumbFormData = this.createForm(thumbData.fields, curThumbFile);
                    doSignedS3Post(thumbData.url, thumbFormData).then(res => {
                        if (res.ok) {
                            console.log("thumbnail uploaded!");
                        }
                        else {
                            console.log("thumbnail not uploaded");
                        }

                    });
                }).catch(err => {
                    console.log("Problem with the JSON returned from fetching presigned posts: " + err);
                    this.curFileNum++;
                    return this.upload();
                });
            }
            else {
                console.log("Problem generating presigned post. Here's the response...");
                console.log(res);
                this.curFileNum++;
                return this.upload();
            }
        }).catch(err => {
            console.log("Problem fetching presigned post: " + err);
            this.curFileNum++;
            return this.upload();
        });
    }

    upload = () => {
        if (this.curFileNum >= this.uploads.length) {
            return;
        }
        console.log(`Starting upload at index ${this.curFileNum}`);

        let curFile = this.uploads[this.curFileNum].file;
        let curThumbFile = this.uploads[this.curFileNum].thumbfile;
        
        // it's likely that the thumbnail hasn't been generated yet, especially if this is the first upload. 
        if(!curThumbFile) {
            setTimeout(() => {
                this.upload();
            }, 250)
            return;
        }

        let tempUploadId = this.uploads[this.curFileNum].uploadId;
        let fileSize = curFile.size;


        if (curFile.size / (1000 * 1000) > this.maxUploadSize) {
            this.setError(this.curFileNum, `File Must Not Exceed ${formatBytes(this.maxUploadSize * 1000 * 1000)}`);
            this.curFileNum++;
            return this.upload();
        }

        if (!this.isValidType(curFile.type)) {
            this.setError(this.curFileNum, `File must be of type {${this.allowedMimeTypes}}. '${curFile.type}' was provided`);
            this.curFileNum++;
            return this.upload();
        }

        let fileParts = curFile.name.split('.');

        let fileInfo = {
            fileName: fileParts[0],
            fileType: fileParts[1],
            action: "photo"
        };

        let startTime = new Date().getTime();
        getPresignedPost(fileInfo).then(res => {
            if (res.ok) {
                res.json().then(data => {
                    const { photoData = {}, thumbData = {}, uploadId } = data;
                    const photoFormData = this.createForm(photoData.fields, curFile);
                    
                    this.updateUploads(tempUploadId, { uploadId: uploadId, fileName: photoData.fields.key, thumbName: thumbData.fields.key });
        
                    // starts the progress bar rolling...
                    this.doProgressBar(this.uploads[this.curFileNum], fileSize, this.state.estimatedUploadRate);
                    // upload photo to s3
                    doSignedS3Post(photoData.url, photoFormData).then(res => {
                        if (res.ok) {
                            let endTime = new Date().getTime();
                            this.setUploadRate(endTime, startTime, fileSize);
                            this.updateUploads(uploadId, { status: 'editing' });
                            console.log("file uploaded to s3!");
                        }
                        else {
                            console.log("File could not be uploaded to s3.");
                            this.updateUploads(uploadId, { err: "File couldnt be uploaded." });
                            res.text().then(text => {
                                console.log(text);
                            });
                        }
                        this.curFileNum++;
                        return this.upload();

                    }).catch(err => {
                        console.log("Problem doing signed s3 post: " + err);
                        this.curFileNum++;
                        return this.upload();
                    });
                    // upload thumbnail to s3
                    const thumbFormData = this.createForm(thumbData.fields, curThumbFile);
                    doSignedS3Post(thumbData.url, thumbFormData).then(res => {
                        if (res.ok) {
                            console.log("thumbnail uploaded!");
                        }
                        else {
                            console.log("thumbnail not uploaded");
                        }

                    });
                }).catch(err => {
                    console.log("Problem with the JSON returned from fetching presigned posts: " + err);
                    this.curFileNum++;
                    return this.upload();
                });
            }
            else {
                console.log("Problem generating presigned post. Here's the response...");
                console.log(res);
                this.curFileNum++;
                return this.upload();
            }
        }).catch(err => {
            console.log("Problem fetching presigned post: " + err);
            this.curFileNum++;
            return this.upload();
        });
    }

    setThumbnail = (uploadId, blob) => {
        this.updateUploads(uploadId, {thumbfile: blob})
    }

    render() {
        const { classes } = this.props;

        if(!this.state.cvLoaded) {
            return(
                <h4>Please Wait</h4>
            );
        }

        return (
            <Container component="main" maxWidth="md" className={classes.root} >
                <Grid
                    container
                    direction="column"
                    justify="space-evenly"
                    alignItems="center"
                >
                    <Grid
                        container item
                        direction="row"
                        justify="center"
                        alignItems="center"
                        spacing={2}
                    >
                        <Box className={`${classes.container} ${this.state.filesHovering ? classes.droppingFiles : ''}`}
                            onDrop={this.dropHandler}
                            onDragOver={this.dragOverHandler}
                            onDragLeave={this.dragEndHandler}
                        >
                            {this.state.uploads.length > 0 &&
                                <Grid item xs={12}>
                                    <Box className={classes.subContainer} p={2}>
                                        <TextField
                                            fullWidth
                                            label="Please Enter Album Title"
                                            variant="outlined"
                                            onChange={this.setAlbumTitle}
                                        />
                                    </Box>
                                </Grid>
                            }


                            {this.state.uploads.map(upload =>
                                <Grid item xs={12} key={upload.uploadId + "_grid"}>
                                    <Upload
                                        uploadId={upload.uploadId}
                                        upload={upload}
                                        requestTagSuggestions={this.requestTagSuggestions}
                                        suggestions={upload.suggestions}
                                        addTag={this.addTag}
                                        removeTag={this.removeTag}
                                        setDescription={this.setDescription}
                                        onThumbnailMade={this.setThumbnail}
                                    />
                                </Grid>
                            )}


                            <Grid item container
                                className={classes.inputContainer}
                                direction="column"
                                justify="center"
                                alignItems="center" >
                                <input type="file" id={INPUT_ID} accept={this.allowedMimeTypes} multiple onChange={this.selectFilesUpload} />
                                <p>Or Drag and Drop Files</p>
                            </Grid>


                            {this.state.uploads.length > 0 &&
                                <Grid item container
                                    direction="row"
                                    justify="center"
                                    alignItems="flex-start" >
                                    <Button className={classes.btn} variant="contained" color="secondary" onClick={this.cancel} > Cancel </Button>
                                    <Button className={classes.btn} variant="contained" color="primary" onClick={this.share} > Share! </Button>
                                </Grid>
                            }

                        </Box>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

export default withStyles(useStyles)(ImageUploader);