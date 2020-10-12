import React from "react";
import { Container, Grid, Card, Box, TextField, Button, Typography } from "@material-ui/core";
import UploaderBase from "./UploaderBase";
import { withStyles } from '@material-ui/core/styles';
import MakeImage from "./MakeImage";
import { Redirect } from "react-router-dom";
import { postPhotoGallery } from '../../util/data';
import MakeGif from "./MakeGif";
import ShowError from "./ShowError";
import { UploadState } from "./UploadState";
import { UploadType } from "./UploadType";
import FileBar from './FileBar';

const INPUT_ID = "img-uploader-input";
const MAX_UPLOAD_SIZE = 70;

const useStyles = theme => ({
    container: {
        backgroundColor: theme.palette.primary.light,
        padding: theme.spacing(1),
        border: `4px dashed ${theme.palette.secondary.light}`,
        marginTop: theme.spacing(2),
        width: '100%',
    },
    subContainer: {
        backgroundColor: "white",
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(2)
    },
    droppingFiles: {
        opacity: .5
    },
    btn: {
        margin: theme.spacing(2)
    },
    inputContainer: {
        marginTop: theme.spacing(2),
        height: '200px',
        background: 'linear-gradient(100deg, rgba(25,209,146,0.5746673669467788) 0%, rgba(15,95,209,0.6222864145658263) 100%)'
    },
    uploadItem: {
        minWidth: '375px',
        maxWidth: '800px'
    },
    fullWidth: {
        width: '100%'
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    }
});


class Uploader extends UploaderBase {
    constructor(props) {
        super(props);
        this.setMakeHandlersCallback(this.defineHandlers);
        this.setAllowedMimeTypes(['image/*', 'video/*']);
        this.setMaxNumUploads(1000);
        this.setInputElementId(INPUT_ID);
        this.setMaxUploadSize(MAX_UPLOAD_SIZE);
        this.cv = null;
    }

    /** addational handlers needed for gif conversion. */
    defineHandlers = () => {
        /*
          To handle gif conversion progress updates
         */
        this.socket.on("ConversionProgress", (data) => {
            // console.log("Conversion Data:");
            // console.log(data);
            const { uploadId } = data;

            this.updateUploads(uploadId, {
                conversionData: data
            });
        });

        /*
          Marks the conversion as complete so we can serve the .gif
         */
        this.socket.on("ConversionComplete", (data) => {
            console.log("ConversionComplete");
            let { fileName, uploadId, thumbName } = data;

            if (fileName) {
                this.updateUploads(uploadId, {
                    fileName: fileName,
                    uploadState: UploadState.DONE,
                    thumbName: thumbName
                });
            }
            else {
                this.updateUploads(uploadId, {
                    error: "File could not be converted. The video is most likely not a supported format."
                });
            }
        });
    }

    /**
     * Tells the server to convert an upload. - Use for making gifs.
     */
    convert = (uploadId, quality) => {
        console.log(`convert: ${uploadId}`);
        this.socket.emit("ConvertRequested", {
            uploadId: uploadId,
            quality: quality
        });

        this.updateUploads(uploadId, { uploadState: UploadState.RENDERING });
    }

    markShared = (uploadId) => {
        console.log(`marking ${uploadId} as shared`);
        this.socket.emit("MarkShared", {
            uploadId: uploadId,
        });
    }


    /**
     * Adds a tag to an upload
     * @param {*} upload 
     * @param {*} tag 
     */
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

    /**
     * Sets the description of an upload
     * @param {*} uploadId
     * @param {*} description 
     */
    setItemDescription = (uploadId, description) => {
        this.updateUploads(uploadId, { description: description });
    }

    /**
     * Removes a tag from an upload.
     * @param {*} upload 
     * @param {*} tag 
     */
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

    /**
     * Determines whether this upload session produced
     * an album or a single media item and POSTs to server accordingly
     */
    share = () => {
        console.log("woof!");
        console.log(this.state);

        const { albumTitle = "" } = this.state;
        let album, media;

        // check each upload to make sure we're good to go
        for (let i = 0; i < this.uploads.length; i++) {
            // uploads in the error state can just be discarded.
            if (this.uploads[i].error) {
                this.removeUpload(this.uploads[i].uploadId);
                continue;
            }

            // it's a video to gif
            if (this.uploads[i].uploadType === UploadType.VID_TO_GIF) {
                if (this.uploads[i].uploadState === UploadState.DONE) {
                    this.markShared(this.uploads[i].uploadId);
                }
                else {
                    alert(`Please finish converting ${this.uploads[i].file.name} to a gif, or remove it.`);
                    return;
                }
            }

            if (this.uploads[i].uploadType === UploadType.IMG) {
                // TODO validate for rendering.
            }
        }

        // we can close the socket now.
        console.log("closing socket.");
        this.socket.disconnect();

        this.curFileNum = 0;
        this.upload(() => {
            if (this.uploads.length < 1) {
                alert("Please choose some content to share.");
                return;
            }
            else if (this.uploads.length > 1) {
                // this is an album
                album = {
                    albumTitle: albumTitle.trim(),
                    items: []
                };
                // add each item to the album
                for (let i = 0; i < this.state.uploads.length; i++) {
                    let curUpload = this.state.uploads[i];
                    album.items.push({
                        uploadId: curUpload.uploadId,
                        description: curUpload.description,
                        fileName: curUpload.fileName,
                        tags: curUpload.tags,
                        thumbName: curUpload.thumbName,
                        fullSizeName: curUpload.fullSizeName,
                        originalFileName: curUpload.getFile(curUpload.file).name,
                        fileType: curUpload.file.type
                    });
                };
            }
            else if (this.uploads.length === 1) {
                // this is just a single item
                let curUpload = this.state.uploads[0];
                media = {
                    uploadId: curUpload.uploadId,
                    description: curUpload.description,
                    fileName: curUpload.fileName,
                    tags: curUpload.tags,
                    thumbName: curUpload.thumbName,
                    originalFileName: curUpload.getFile(curUpload.file).name,
                    fileType: curUpload.file.type,
                    fullSizeName: curUpload.fullSizeName
                };
            }

            postPhotoGallery({ album: album, media: media }).then(res => {
                if (res.ok) {
                    res.json().then(resJson => {
                        this.setState({ redirect: resJson.redirect })
                    }).catch(err => console.log(err))
                }
            }).catch(err => console.log(err));
        });
    }

    componentDidMount = () => {
        // TODO cancel subscription instead? 
        this._isMounted = true;

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


    /**
     * Creates a form and appends a file to it.
     * @param {*} fields 
     * @param {*} file 
     */
    createForm = (fields, file) => {
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => {
            formData.append(k, v);
        });
        formData.append("file", file);
        return formData;
    }

    setAlbumTitle = (event) => {
        this.setState({
            albumTitle: event.target.value
        });
    }

    /**
     * add's a thumbnail to the upload
     * @param {*} uploadId 
     * @param {*} blob the thumbnail
     */
    setThumbnail = (uploadId, blob) => {
        this.updateUploads(uploadId, { thumbFile: blob })
    }

    setImage = (uploadId, blob) => {
        this.updateUploads(uploadId, { file: blob })
    }

    getNumValidUploads = () => {
        let num = 0;
        for (let i = 0; i < this.uploads.length; i++) {
            if (!this.uploads[i].error) {
                num++;
            }
        }

        return num;
    }

    getMaxWidth = () => {
        if (this.state.uploads.length > 1) {
            return "lg";
        }
        else {
            return "sm";
        }
    }

    /**
     * Sets the make images callback to allow images to be created at upload time.
     * @param {*} uploadId 
     * @param {*} func function to render media, such as cropped images, thumbnails, etc.
     */
    setRenderMedia = (uploadId, func) => {
        this.updateUploads(uploadId, { renderMedia: func });
    }

    getUploadComponent = (upload) => {
        const { uploadState, uploadType } = upload;
        const { classes } = this.props;

        if (uploadState === null) {
            return (
                <Card className={classes.card}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        spacing={2}
                        className="root"
                    >
                        <Grid item xs={12}>
                            <FileBar
                                upload={upload}
                                removeUpload={this.removeUpload}
                                shiftUpload={this.shiftUpload}
                                showShift={this.state.uploads.length === 1}
                            />
                        </Grid>
                        <Grid item xs={10}>
                            <Typography variant='h6'>Please Wait...</Typography>
                        </Grid>
                    </Grid>
                </Card>
            );
        }

        if (uploadState === UploadState.ERR) {
            return (
                <ShowError
                    upload={upload}
                />);
        }

        if (uploadType === UploadType.IMG) {
            return (
                <MakeImage
                    upload={upload}
                    requestTagSuggestions={this.requestTagSuggestions}
                    addTag={this.addTag}
                    removeTag={this.removeTag}
                    setDescription={this.setItemDescription}
                    onThumbnailMade={this.setThumbnail}
                    onImageMade={this.setImage}
                    removeUpload={this.removeUpload}
                    shiftUpload={this.shiftUpload}
                    singleImage={this.state.uploads.length === 1}
                    setMakeImages={this.setRenderMedia}
                />
            );
        }
        if (uploadType === UploadType.VID_TO_GIF) {
            return (
                <MakeGif
                    upload={upload}
                    requestTagSuggestions={this.requestTagSuggestions}
                    addTag={this.addTag}
                    removeTag={this.removeTag}
                    setDescription={this.setItemDescription}
                    onThumbnailMade={this.setThumbnail}
                    removeUpload={this.removeUpload}
                    shiftUpload={this.shiftUpload}
                    convert={this.convert}
                    singleImage={this.state.uploads.length === 1}
                />
            );
        }
    }

    render() {
        if (this.state.redirect) {
            return (
                <Redirect to={this.state.redirect} />
            );
        }

        const { classes } = this.props;

        if (!this.state.cvLoaded) {
            return (
                <h4>Please Wait</h4>
            );
        }

        return (
            <Container disableGutters={true} component="div" maxWidth={this.getMaxWidth()} >
                <Grid
                    container item
                    direction="column"
                    justify="center"
                    alignItems="center"
                    spacing={2}
                >
                    <Box className={`${classes.container} ${this.state.filesHovering ? classes.droppingFiles : ''}`}
                        onDrop={this.dropHandler}
                        onDragOver={this.dragOverHandler}
                        onDragLeave={this.dragEndHandler}
                    >
                        {/* It's not an album unless there are multiple items */}
                        {this.getNumValidUploads() > 1 &&
                            <Grid item xs={12}>
                                <Box className={classes.subContainer} p={2}>
                                    <TextField
                                        fullWidth
                                        label="Album Title"
                                        variant="outlined"
                                        onChange={this.setAlbumTitle}
                                    />
                                </Box>
                            </Grid>
                        }

                        <Grid
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="center"
                            spacing={2}
                        >
                            {/* Show each upload */}
                            {this.state.uploads.map(upload =>
                                <Grid className={classes.uploadItem} item xs key={upload.uploadId + "_grid"}>
                                    {this.getUploadComponent(upload)}
                                </Grid>
                            )}
                        </Grid>

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
            </Container>

        );
    }
}

export default withStyles(useStyles)(Uploader);