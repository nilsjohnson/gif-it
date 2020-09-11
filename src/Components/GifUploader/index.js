import React from "react";
import Upload from "./Upload";
import { DropBox } from "../DropBox";
import { Grid, Box } from "@material-ui/core";
import UploaderBase from "../UploaderBase/Index";

const INPUT_ID = "gif-input";

/**
 * This Componenent allows users to upload files and convert them to gifs
 */
class GifUploader extends UploaderBase {
  constructor(props) {
    super(props);
    this.setMakeHandlersCallback(this.defineHandlers);
    this.setMaxUploadSize(70);
    this.setAllowedMimeTypes([ "image/gif", "video/*" ]);
    this.setMaxNumUploads(6);
    this.setInputElementId(INPUT_ID)
  }

  defineHandlers = () => {
    /*
      To handle conversion progress updates
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
      let { servePath, uploadId } = data;

      if (servePath) {
        this.updateUploads(uploadId, {
          servePath: servePath,
          status: "complete"
        });
      }
      else {
        this.updateUploads(uploadId, {
          error: "File could not be converted. The video is most likely not a supported format."
        });
      }
    });

    /*
      If the user shares, we update the status to 'shared'
    */
    this.socket.on("ShareResult", (data) => {
      console.log("ShareResult hit");
      console.log(data);
      const { status, uploadId, error } = data;

      if (error) {
        this.updateUploads(uploadId, {
          error: error
        });

        return;
      }

      this.updateUploads(uploadId, {
        status: status
      });
    });

  }

  /**
   * Tells the server to convert an upload.
   */
  convert = (uploadId, quality) => {
    console.log(`convert: ${uploadId}`);
    this.socket.emit("ConvertRequested", { uploadId: uploadId, quality: quality });

    for (let i = 0; i < this.uploads.length; i++) {
      if (this.uploads[i].uploadId === uploadId) {
        this.uploads[i].status = "converting";
        break;
      }
    }

    this.setState({
      uploads: this.uploads
    });
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


  render() {
    return (
      <Box>
        <Grid
          container
          direction="column"
          justify="space-evenly"
          alignItems="center"
        >
          <Grid item container>
            <DropBox
              onDrop={this.dropHandler}
              onDragOver={this.dragOverHandler}
              onDragLeave={this.dragEndHandler}
              hovering={this.state.filesHovering}
              selectFilesUpload={this.selectFilesUpload}
              uploadInstructionsText={"Please Drag And Drop Video Files, Or"}
              mimeTypes={"video/*, image/gif"}
              error={this.state.tooManyFilesSelected ? `Please select no more than ${this.maxNumUploads} files.` : ''}
              id={INPUT_ID}
            />
          </Grid>
        </Grid>

        {/* Upload Wells start here */}
        <Grid
          container
          direction="row"
          justify="space-evenly"
          alignItems="flex-start"
        >
          {/* Padding element */}
          <Grid item sm={2}></Grid>

          {/* The upload container */}
          <Grid item container xs={12} sm={8}>
            {this.state.uploads.map(upload =>
              <Grid item xs={12} key={upload.uploadId + "_grid"}>
                <Upload
                  key={upload.uploadId}
                  uploadId={upload.uploadId}
                  fileName={upload.file.name}
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
                  servePath={upload.servePath}
                  error={upload.error}
                />
              </Grid>
            )}
          </Grid>

          {/* Padding element */}
          <Grid item sm={2}></Grid>

        </Grid>

      </Box>);
  }
}

export default GifUploader;


