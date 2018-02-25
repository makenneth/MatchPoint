import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import NoteIcon from 'react-icons/lib/fa/sticky-note-o';

import ClubNote from './ClubNote';

export default class OperationInfo extends Component {
  handleSubmit = (event) => {
    event.preventDefault();

    if (this.validate()) {
      this.props.handleSubmit(this.props.type, this.state.note);
    }
  }

  handleChange(field, val) {
    const { [field]: error, ...rest } = this.state.errors;
    if (error) {
      this.setState({ errors: rest });
    }
    this.setState({ [field]: val });
  }

  validate() {
    const errors = {};
    let isValid = true;

    if (this.state.note.length > 500) {
      errors.clubName = 'Note cannot exceed 500 characters.';
      isValid = false;
    }

    if (!isValid) {
      this.setState({ errors });
    }
    return isValid;
  }

  render() {
    const { isLoading, notes = {} } = this.props;

    return (<div className="contact-info-container--notes">
      <h2 className="contact-info-container--title">
        <NoteIcon />
        Notes
      </h2>
      <ClubNote
        type="direction"
        note={notes.direction}
      />
      <ClubNote
        type="roundrobin"
        note={notes.roundrobin}
      />
      <ClubNote
        type="operation"
        note={notes.operation}
      />
    </div>);
  }
}
