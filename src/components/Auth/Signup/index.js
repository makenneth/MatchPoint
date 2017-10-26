import React, { Component } from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import { signUp } from 'redux/modules/auth';

@connect(({ auth: { error, loading } }) => ({ error, loading }), { signUp })
export default class SignUpForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: 'kxmingg@gmail.com',
      username: 'testuser',
      password: 'password',
      passwordRepeat: 'password',
      clubName: 'Test Club',
      state: 'CA',
      city: 'San Francisco',
      errors: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.error !== this.props.error && nextProps.error) {
      this.setState({
        errors: nextProps.error
      });
    }
  }

  validate() {
    const emailRegex = new RegExp('.+@.+..+', 'i');
    let isValid = true;
    const errors = {};
    if (this.state.clubName.length === 0) {
      errors.clubName = 'Club name cannot be empty';
      isValid = false;
    }
    if (this.state.city.length === 0) {
      errors.city = 'City cannot be empty';
      isValid = false;
    }
    if (this.state.state.length === 0) {
      errors.state = 'State cannot be empty';
      isValid = false;
    }

    if (!/^[0-9a-z]+$/.test(this.state.username)) {
      errors.username = 'Username can only contain alphanumeric characters.';
      isValid = false;
    } else if (this.state.username.length < 8) {
      errors.username = 'Username must be at least 8 characters long';
      isValid = false;
    }
    if (this.state.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else if (this.state.passwordRepeat.length > 1 &&
      this.state.password !== this.state.passwordRepeat) {
      errors.passwordRepeat = 'Passwords must match';
      errors.password = 'Passwords must match';
      isValid = false;
    }
    if (!emailRegex.test(this.state.email)) {
      errors.email = 'Email is not a valid format';
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  }

  updateField(field, e) {
    const { [field]: fieldError, ...errors } = this.state.errors;

    if (fieldError) {
      this.setState({ errors });
    }
    this.setState({ [field]: e.target.value });
  }

  updatePassword = (field, e) => {
    const self = e.target.value;
    const other = field === 'password' ?
      this.state.passwordRepeat :
      this.state.password;
    const repeatError = this.state.errors.passwordRepeat;
    if (repeatError) {
      if (self === other) {
        this.setState({
          errors: {
            ...this.state.errors,
            passwordRepeat: null,
            password: null,
          },
        });
      }
    }

    this.setState({ [field]: self });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.validate()) {
      // eslint-disable-next-line no-unused-vars
      const { errors, ...rest } = this.state;
      this.props.signUp(rest);
    }
  }
  render() {
    const { errors } = this.state;
    const { loading } = this.props;
    return (<div className="forms">
      <form onSubmit={this.handleSubmit}>
        <h3>Sign Up</h3>
        <div>
          <TextField
            type="text"
            value={this.state.clubName}
            floatingLabelText="Club Name"
            onChange={e => this.updateField('clubName', e)}
            errorText={errors.clubName}
            required
          />
        </div>
        <div>
          <TextField
            type="text"
            value={this.state.city}
            floatingLabelText="City"
            onChange={e => this.updateField('city', e)}
            errorText={errors.city}
            required
          />
        </div>
        <div>
          <TextField
            type="text"
            value={this.state.state}
            floatingLabelText="State"
            onChange={e => this.updateField('state', e)}
            errorText={errors.state}
            required
          />
        </div>
        <div>
          <TextField
            type="text"
            value={this.state.username}
            floatingLabelText="Username"
            onChange={e => this.updateField('username', e)}
            errorText={errors.username}
            required
          />
        </div>
        <div>
          <TextField
            type="email"
            value={this.state.email}
            floatingLabelText="Email"
            onChange={e => this.updateField('email', e)}
            errorText={errors.email}
            required
          />
        </div>
        <div>
          <TextField
            type="password"
            value={this.state.password}
            floatingLabelText="Password"
            onChange={(e) => this.updatePassword('password', e)}
            errorText={errors.password}
            required
          />
        </div>
        <div>
          <TextField
            type="password"
            value={this.state.passwordRepeat}
            floatingLabelText="Password Repeat"
            onChange={(e) => this.updatePassword('passwordRepeat', e)}
            errorText={errors.passwordRepeat}
            required
          />
        </div>
        {loading && <CircularProgress
          size={0.5}
          color="#aaa"
          style={{ marginTop: '10px' }}
          className="circular-progress"
        />}
        {!loading && <div className="button-div">
          <RaisedButton
            backgroundColor="#00796B"
            labelColor="white"
            onClick={this.handleSubmit}
            label="Sign Up"
          />
        </div>}
        {!loading && <div className="redirect-signup">
          Already have an account yet?&nbsp;&nbsp;
          <a onClick={() => this.props.setPage(1)}>Log In</a>
        </div>}
      </form>
    </div>);
  }
}
