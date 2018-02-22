import React, { Component } from 'react';
import { connect } from 'react-redux';
import { upload, startLoading, stopLoading } from 'redux/modules/upload';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

const style = {
  cursor: 'pointer',
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  width: '100%',
  opacity: 0,
};

@connect(({ uploadReducer: { processing } }) => ({ processing }),
  { upload, startLoading, stopLoading })
export default class FileUploader extends Component {
  state = {
    data_uri: null,
    filename: null,
    filetype: null,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.processing !== nextState.processing ||
      this.state.filename !== nextState.filename) {
      return true;
    }

    return false;
  }

  clubChanged = () => {
    this.setState({ processing: false });
  }
  updateFile = (e) => {
    const file = e.target.files[0];
    if (/csv|json/.test(file.type)) {
      const reader = new FileReader();
      this.props.startLoading();
      reader.onload = (uploadFile) => {
        this.setState({
          data_uri: uploadFile.target.result,
          filename: file.name,
          filetype: file.type,
        });
        this.props.stopLoading();
      };
      reader.readAsDataURL(file);
    } else {
      this.setState({
        filename: `Unrecognized file type: .${file.type}`,
      });
    }
  }
  uploadFile = (e) => {
    e.preventDefault();
    if (this.state.data_uri && this.state.filetype && this.state.filename) {
      this.props.upload({
        data_uri: this.state.data_uri,
        filename: this.state.filename,
        filetype: this.state.filetype,
      });
    }
  }
  loader() {
    return (this.state.processing && (<div className="overlay">
      <div className="loading">
        <CircularProgress size={25} />
      </div>
    </div>));
  }

  render() {
    const buttonLabel = this.state.filename ?
      `File:  ${this.state.filename}` :
      'Choose a file (.csv or .json)';
    return (
      <form
        id="upload-form"
        encType="multipart/form-data"
        onSubmit={this.uploadFile}
      >
        <RaisedButton
          style={{ midWidth: '150px', marginRight: '10px' }}
          label={buttonLabel}
          labelPosition="before"
          containerElement="label"
        >
          <input
            type="file"
            onChange={this.updateFile}
            style={style}
          />
        </RaisedButton>
        <RaisedButton
          label="Upload"
          labelPosition="before"
          containerElement="label"
          primary={Boolean(true)}
          disabled={!this.state.data_uri}
        >
          <input type="submit" style={style} />
        </RaisedButton>
        {this.loader()}
      </form>
    );
  }
}
