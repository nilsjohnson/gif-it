import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import SettingOptions from './SettingOptions';
import Complete from './Complete';
import Converting from './Converting';
import FileBar from '../FileBar';
import EnterDescription from '../EnterDescription';
import TagInputBox from '../../TagInputBox';


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
    paddingTop: theme.spacing(2),
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
    this.props.removeUpload(this.props.uploadId);
  }

  requestTagSuggestions = (curInput) => {
    const { requestTagSuggestions, upload = {} } = this.props;
    requestTagSuggestions(upload.uploadId, curInput);
  }

  getElement = () => {

    const { upload = {}, classes } = this.props;
    const { conversionData = {} } = upload;


    switch (upload.status) {
      case 'uploading':
        return (
          ""
        );

      case 'settingOptions':
        return (
          <SettingOptions
            classes={classes}
            upload={upload}
            convert={this.convert}
            size={this.state.size}
            setSize={this.setSize}
          />
        );

      case 'converting':
        return (
          <Converting
            fileName={upload.fileName}
            speed={conversionData.curSpeed}
            error={upload.error}
            progress={conversionData.progress}
          />
        );

      case 'complete':
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
          <Grid item xs={10}>
            {this.getElement()}
          </Grid>
          {upload.status === 'complete' && <React.Fragment>
          <Grid xs={10} item>
            <EnterDescription setDescription={this.setDescription} />
          </Grid>
          <Grid xs={10} item>
            <TagInputBox
              suggestions={upload.tagSuggestions}
              tags={upload.tags}
              addTag={this.addTag}
              removeTag={this.removeTag}
              requestTagSuggestions={this.requestTagSuggestions}
              share={this.share}
            />
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