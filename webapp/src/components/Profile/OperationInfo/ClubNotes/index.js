import React from 'react';
import NoteIcon from 'react-icons/lib/fa/sticky-note-o';

import ClubNote from './ClubNote';

export default class OperationInfo extends React.PureComponent {
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
    const { clubNotes: { isLoading, errors }, notes = {} } = this.props;

    return (<div className="contact-info-container--notes">
      <h2 className="contact-info-container--title">
        <NoteIcon />
        Notes
      </h2>
      <ClubNote
        isLoading={isLoading.direction}
        error={errors.direction}
        type="direction"
        note={notes.direction}
        handleSubmit={this.props.handleSubmit}
        setMessage={this.props.setMessage}
      />
      <ClubNote
        isLoading={isLoading.roundrobin}
        error={errors.roundrobin}
        type="roundrobin"
        note={notes.roundrobin}
        handleSubmit={this.props.handleSubmit}
        setMessage={this.props.setMessage}
      />
      <ClubNote
        isLoading={isLoading.operation}
        error={errors.operation}
        type="operation"
        note={notes.operation}
        handleSubmit={this.props.handleSubmit}
        setMessage={this.props.setMessage}
      />
    </div>);
  }
}
