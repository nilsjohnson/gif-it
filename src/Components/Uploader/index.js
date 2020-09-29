import React from "react";
import { Container, Grid, Box, TextField, Button } from "@material-ui/core";
import UploaderBase from "./UploaderBase";
import { withStyles } from '@material-ui/core/styles';
import MakeImage from "./MakeImage";
import { Redirect } from "react-router-dom";
import { postPhotoGallery } from '../../util/data';
import MakeGif from "./MakeGif";

const INPUT_ID = "img-uploader-input";
const PROGRESS_BAR_UPDATE_INTERVAL = 250; // milliseconds

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
        height: '200px',
        background: 'linear-gradient(100deg, rgba(25,209,146,0.5746673669467788) 0%, rgba(15,95,209,0.6222864145658263) 100%)'
    }
});


class Uploader extends UploaderBase {
    constructor(props) {
        super(props);
        this.setMakeHandlersCallback(this.defineHandlers);
        this.setAllowedMimeTypes(['image/*', 'video/*']);
        this.setMaxNumUploads(2);
        this.setInputElementId(INPUT_ID);
        this.setMaxUploadSize(70);
        this.cv = null;
    }

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
          console.log(data);
          let { fileName, uploadId, thumbName } = data;
    
          if (fileName) {
            this.updateUploads(uploadId, {
              fileName: fileName,
              status: "complete",
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
       * Tells the server to convert an upload.
       */
      convert = (uploadId, quality) => {
        console.log(`convert: ${uploadId}`);
        this.socket.emit("ConvertRequested", { 
            uploadId: uploadId, 
            quality: quality 
        });
        
        this.updateUploads(uploadId, {status: "converting"});
      }
    
      /**
       * Tells the server to add gif to database with given tags.
       */
      share = (uploadId, tags, description) => {
        console.log(uploadId);
        console.log(tags);
        console.log(description);
    
        this.socket.emit("ShareRequest", {
          uploadId: uploadId,
          tags: tags,
          description: description
        });
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
        const { albumTitle = "", albumDescription = "" } = this.state;
        let album, media;
        console.log(this.uploads);


        if(this.uploads.length > 1) {
            console.log("album.");
            // this is an album
             album = {
                albumTitle: albumTitle.trim(),
                albumDescription: albumDescription.trim(),
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
                    originalFileName: curUpload.file.name,
                    fileType: curUpload.file.type
                });
            };
        }
        else if(this.uploads.length === 1) {
            console.log("single");
            // this is just a single item
            let curUpload = this.state.uploads[0];
            media = {
                uploadId: curUpload.uploadId,
                description: curUpload.description,
                fileName: curUpload.fileName,
                tags: curUpload.tags,
                thumbName: curUpload.thumbName,
                originalFileName: curUpload.file.name,
                fileType: curUpload.file.type
            };
        }
           
        postPhotoGallery({album: album, media: media}).then(res => {
            if (res.ok) {
                res.json().then(resJson => {
                    this.setState({ redirect: resJson.redirect })
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err));


    }

    componentDidMount = () => {
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
            formData.append(k, v);
        });
        formData.append("file", file);
        return formData;
    }


    /**
     * A recursive method to update the progress bar of an upload.
     * @param {*} totalUploaded the amount of data that has been uploaded
     * @param {*} upload the upload being uploaded
     * @param {*} fileSize the size of the file being uploaded
     */
    doProgressBar = (upload, fileSize, rate, totalUploaded = 0) => {
        setTimeout(() => {
            if (totalUploaded >= fileSize) {
                return;
            }

            totalUploaded += rate;
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

    setAlbumDescription = (event) => {
        this.setState({
            albumTitle: event.target.value
        });
    }

    setUploadRate = (startTime, endTime, fileSize) => {
        this.estimatedUploadRate = fileSize * PROGRESS_BAR_UPDATE_INTERVAL / (endTime - startTime);
    }

    setThumbnail = (uploadId, blob) => {
        this.updateUploads(uploadId, { thumbFile: blob })
    }

    getUploadComponent = (upload) => {

        if (upload.file.type.startsWith('image')) {
            return (
                <MakeImage
                    uploadId={upload.uploadId}
                    upload={upload}
                    requestTagSuggestions={this.requestTagSuggestions}
                    suggestions={upload.suggestions}
                    addTag={this.addTag}
                    removeTag={this.removeTag}
                    setDescription={this.setDescription}
                    onThumbnailMade={this.setThumbnail}
                    removeUpload={this.removeUpload}
                />
            );
        }
        else if (upload.file.type.startsWith('video')) {
            return (
                <MakeGif
                    key={upload.uploadId}
                    file={upload.file}
                    upload={upload}
                    uploadId={upload.uploadId}
                    fileName={upload.fileName}
                    size={upload.file.size}
                    percentUploaded={upload.percentUploaded}
                    conversionData={upload.conversionData}
                    status={upload.status}
                    conversionComplete={upload.conversionComplete}
                    requestTagSuggestions={this.requestTagSuggestions}
                    suggestions={upload.suggestions}
                    share={this.share}
                    convert={this.convert}
                    removeUpload={this.removeUpload}
                    error={upload.error}
                />
            );
        }


    }


    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        const { classes } = this.props;

        if (!this.state.cvLoaded) {
            return (
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
                            {this.state.uploads.length > 1 &&
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


                            {this.state.uploads.map(upload =>
                                <Grid item xs={12} key={upload.uploadId + "_grid"}>
                                    {this.getUploadComponent(upload)}
                                </Grid>
                            )}


                            {this.state.tooManyFilesSelected && <p>Too many Files!</p>}
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

export default withStyles(useStyles)(Uploader);