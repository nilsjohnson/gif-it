import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Grid, Box } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import SettingOptions from './SettingOptions';
import Complete from './Complete';
import Converting from './Converting';
import FileBar from '../FileBar';
import EnterDescription from '../EnterDescription';
import TagInputBox from '../../TagInputBox';
import { UploadState } from '../UploadState';
import Uploading from './Uploading';


const useStyles = theme => ({
  fullWidth: {
    width: '100%'
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
});


/**
 * Each Upload gets its own Component
 */
class MakeGif extends Component {
  constructor(props) {
    super(props)

    this.state = ({
      size: 'md',
      message: ''
    });
  }

  setSize = (event) => {
    this.setState({ size: event.target.value });
  }

  addTag = (tag) => {
    this.props.addTag(this.props.upload, tag)
  }

  removeTag = (tag) => {
    this.props.removeTag(this.props.upload, tag)
  }

  setDescription = (description) => {
    this.props.setDescription(this.props.upload.uploadId, description);
  }

  convert = () => {
    let id = this.props.upload.uploadId;
    this.props.convert(id, this.state.size);
  }

  cancel = () => {
    this.props.removeUpload(this.props.upload.uploadId);
  }

  requestTagSuggestions = (curInput) => {
    const { requestTagSuggestions, upload = {} } = this.props;
    requestTagSuggestions(upload.uploadId, curInput);
  }

  getElement = () => {

    const { upload = {}, classes } = this.props;
    const { conversionData = {} } = upload;


    switch (upload.uploadState) {
      // Do nothing, showing the FileBar is enough
      case UploadState.UPLOADING:
        return (
          <Uploading cancel={this.cancel}/>
        );

      case UploadState.SETTING_OPTIONS:
        return (
          <SettingOptions
            classes={classes}
            upload={upload}
            convert={this.convert}
            size={this.state.size}
            setSize={this.setSize}
          />
        );

      case UploadState.RENDERING:
        return (
          <Converting
            fileName={upload.fileName}
            speed={conversionData.curSpeed}
            error={upload.error}
            progress={conversionData.progress}
          />
        );

      case UploadState.DONE:
        return (
          <Complete
            fileName={upload.fileName}
          />
        );

      case UploadState.PENDING_SHARE:
        return (
          <Complete
            fileName={upload.fileName}
          />
        );
      default: return ("");
    }
  }

  render() {
    const { upload, classes, removeUpload, shiftUpload, singleImage } = this.props;

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
              removeUpload={removeUpload}
              shiftUpload={shiftUpload}
              showShift={!singleImage}
            />
          </Grid>
          <Grid item xs={12}>
            {this.getElement()}
          </Grid>
          {upload.uploadState === UploadState.DONE && <React.Fragment>
            <Grid xs={12} item>
              <Box p={2}>
                <EnterDescription setDescription={this.setDescription} />
                <TagInputBox
                  suggestions={upload.tagSuggestions}
                  tags={upload.tags}
                  addTag={this.addTag}
                  removeTag={this.removeTag}
                  requestTagSuggestions={this.requestTagSuggestions}
                  share={this.share}
                />
              </Box>

            </Grid> </React.Fragment>}

        </Grid>
      </Card>
    );
  }
}

MakeGif.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number,
  percentUploaded: PropTypes.number
};



export default withStyles(useStyles)(MakeGif);