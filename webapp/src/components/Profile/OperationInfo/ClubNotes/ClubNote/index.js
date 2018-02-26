import React, { Component } from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import Edit from 'react-icons/lib/md/edit';
import Save from 'react-icons/lib/md/check';
import Clear from 'react-icons/lib/md/clear';
import Plus from 'react-icons/lib/go/plus';

export default class ClubNote extends Component {
  constructor(props) {
    super(props);

    this.state = {
      note: props.note || '',
      noteError: null,
      isEditing: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { error, isLoading } = nextProps;
    if (this.props.isLoading && !isLoading) {
      if (error) {
        if (error.note) {
          this.setState({ noteError: error });
        } else {
          this.props.setMessage('Please try again later.');
        }
      } else {
        this.setState({ isEditing: false });
      }
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.validate()) {
      console.log(this.props.type, this.state.note);
      this.props.handleSubmit(this.props.type, this.state.note);
    }
  }

  toggleEdit = () => {
    this.setState({ isEditing: !this.state.isEditing });
  }

  updateNote = (ev) => {
    if (this.state.noteError) {
      this.setState({ noteError: null });
    }
    const note = ev.target.value;
    this.setState({
      note,
      noteError: note.length > 300 ? 'Note cannot exceed 300 characters' : null,
    });
  }

  validate() {
    let isValid = true;

    if (this.state.note.length > 300) {
      isValid = false;
      this.setState({ noteError: 'Note cannot exceed 300 characters.' });
    }

    return isValid;
  }

  render() {
    const { isLoading, type } = this.props;
    const { note, isEditing, noteError } = this.state;

    return (<div className="contact-info-container--note">
      <h3 className="contact-info-container--note-title">
        <span>{type}</span>
        {
          !isLoading && (<span className="contact-info-container--note-buttons">
            {isEditing && <Save
              style={{ color: '#66BB6A', cursor: 'pointer' }}
              onClick={this.handleSubmit}
            />}
            {isEditing && <Clear
              style={{ color: '#EF5350', cursor: 'pointer' }}
              onClick={this.toggleEdit}
            />}
            {!isEditing && this.props.note && <Edit
              style={{ color: '#555', cursor: 'pointer' }}
              onClick={this.toggleEdit}
            />}
            {!isEditing && !this.props.note && <Plus
              style={{ color: '#66BB6A', cursor: 'pointer' }}
              onClick={this.toggleEdit}
            />}
          </span>)
        }
        {
          isLoading && <CircularProgress
            size={25}
            thickness={2}
            color="#aaa"
            style={{ marginTop: '20px' }}
          />
        }
      </h3>
      {
        isEditing && (<div
          className={`
            contact-info-container--note-input
            editing
            ${noteError ? 'error' : ''}
          `}
        >
          <textarea
            value={note}
            onChange={this.updateNote}
            rows={5}
          />
          <span>{`${note.length}/300`}</span>
          {noteError && <div className="contact-info-container--note-error">
            {noteError}
          </div>}
        </div>)
      }
      {
        !isEditing && (
          <div className="contact-info-container--note-input">
            {this.props.note || 'Add a Note'}
          </div>
        )
      }
    </div>);
  }
}
