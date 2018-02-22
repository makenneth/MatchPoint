import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton/IconButton';
import Close from 'react-icons/lib/md/close';

class PlayerForm extends Component {
  constructor(props) {
    super(props);

    const def = {
      name: '',
      rating: '',
    };
    if (props.player) {
      def.id = props.player.id;
      def.name = props.player.name;
      def.rating = props.player.rating;
    }
    this.state = {
      ...def,
      checked: false,
      errors: {
        name: '',
        rating: '',
      },
    };
  }

  componentDidMount() {
    this.nameInput.focus();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.error !== this.props.error) {
      if (nextProps.error) {
        const ratingError = nextProps.error.rating;
        const nameError = nextProps.error.name;
        this.setState({
          errors: {
            ...this.state.errors,
            rating: ratingError,
            name: nameError,
          },
        });
      }
    }
  }

  validateFields() {
    let isValid = true;
    const errors = {};
    if (this.state.name === '') {
      errors.name = 'Name field cannot be empty.';
      isValid = false;
    }
    if (this.state.rating === '0' || this.state.rating === '') {
      errors.rating = 'Rating field cannot be empty.';
      isValid = false;
    }

    if (!isValid) {
      this.setState({ errors });
    }
    return isValid;
  }

  updateRating = (e) => {
    const { rating, ...errors } = this.state.errors;
    if (rating && e.target.value !== '0') {
      this.setState({ errors });
    }
    this.setState({ rating: e.target.value });
  }

  updateName = (e) => {
    const { name, ...errors } = this.state.errors;
    if (name && e.target.value) {
      this.setState({ errors });
    }
    this.setState({ name: e.target.value });
  }

  updateCheck = () => {
    this.setState({ checked: !this.state.checked });
  }

  handleSubmit = () => {
    if (this.validateFields()) {
      this.props.callback(this.state);
    }
  }
  render() {
    const { isLoading } = this.props;
    const { errors } = this.state;
    return (<div
      className="player-form"
      style={{ display: this.props.modalOpen ? 'block' : 'none' }}
    >
      <form>
        <IconButton
          style={{ position: 'absolute', right: '10px', top: '10px' }}
          iconClassName="material-icons"
          onClick={this.props.closeModal}
          tooltip="Close Form" touch={Boolean(true)}
        >
          <Close />
        </IconButton>
        <h3>Player Form</h3>
        <div>
          <TextField
            ref={(input) => { this.nameInput = input; }}
            type="text"
            floatingLabelText="Name"
            id="name"
            hintText="Name"
            onChange={this.updateName}
            errorText={errors.name}
            value={this.state.name}
            required
          />
        </div>
        <div>
          <TextField
            type="text"
            floatingLabelText="Rating"
            hintText="Rating"
            onChange={this.updateRating}
            errorText={errors.rating}
            value={this.state.rating} pattern="^\d{2,4}$"
            required
          />
        </div>
        {
          isLoading && <CircularProgress
            size={25}
            thickness={2}
            color="#aaa"
            style={{ marginTop: '15px' }}
          />
        }
        {!isLoading && !this.props.player && <Checkbox
          label="Add Player afterward"
          checked={this.state.checked}
          onCheck={this.updateCheck}
          style={{ marginTop: '20px', fontSize: '13px' }}
        />}
        {!isLoading && <RaisedButton
          fullWidth={Boolean(true)}
          label={this.props.title}
          style={{ marginTop: '20px' }}
          onTouchTap={this.handleSubmit}
        />}
      </form>
    </div>);
  }
}

export default PlayerForm;
