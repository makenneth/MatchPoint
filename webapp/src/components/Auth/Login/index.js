import React, { Component } from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import { logIn, clearError } from 'redux/modules/auth';
import Divider from 'material-ui/Divider';
import { setPage } from 'redux/modules/splash';

const style = { position: 'relative' };

@connect(({ auth: { error, loading } }) => ({ error, loading }), { logIn, setPage, clearError })
export default class LogInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      errors: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.error !== this.props.error) {
      if (nextProps.error) {
        const usernameError = nextProps.error.username;
        const passwordError = nextProps.error.password;
        this.setState({
          errors: {
            ...this.state.errors,
            username: usernameError,
            password: passwordError,
          },
        });
      }
    }
  }

  updateField(field, e) {
    const { [field]: fieldError, ...errors } = this.state.errors;

    if (fieldError) {
      this.setState({ errors });
    }
    this.setState({ [field]: e.target.value });
  }

  validate() {
    let isValid = true;
    const errors = {};
    if (this.state.username.length < 5) {
      errors.username = 'Username cannot be shorter than 5 characters.';
      isValid = false;
    }

    if (this.state.password.length < 5) {
      errors.password = 'Password cannot be shorter than 5 characters.';
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  }

  handleSubmit = (event) => {
    if (this.validate()) {
      const { username, password } = this.state;
      if (event) {
        event.preventDefault();
        if (event.target.tagName !== 'BUTTON') {
          this.props.logIn({ username, password });
        }
      } else {
        this.props.logIn({ username, password });
      }
    }
  }
  guestLogIn = (event) => {
    event.preventDefault();
    const user = 'guest';
    const password = 'password';
    this.setState({ username: '', password: '' },
      () => {
        let count = 0;
        const int = setInterval(() => {
          if (count < 5) {
            this.setState({ username: this.state.username + user[count++] });
          } else if (count < 13) {
            this.setState({ password: this.state.password + password[count++ - 5] });
          } else {
            clearInterval(int);
            this.handleSubmit();
          }
        }, 200);
      });
  }

  render() {
    const { errors } = this.state;
    return (<div className="forms" style={{ maxHeight: '70vh' }}>
      <form onSubmit={this.handleSubmit}>
        <h3>Log In</h3>
        <div>
          <TextField
            type="text"
            hintText="username"
            floatingLabelText="Username"
            value={this.state.username}
            onChange={e => this.updateField('username', e)}
            errorText={errors.username}
          />
        </div>
        <div>
          <TextField
            type="password"
            hintText="password"
            floatingLabelText="Password"
            value={this.state.password}
            onChange={e => this.updateField('password', e)}
            errorText={errors.password}
          />
        </div>
        {!this.props.loading && <div className="button-div">
          <RaisedButton
            label="Log In"
            backgroundColor="#1565C0"
            labelColor="white"
            style={{ marginRight: '10px' }}
            onClick={this.handleSubmit}
          />
          <RaisedButton label="Guest" backgroundColor="#EF6C00" labelColor="white" onClick={this.guestLogIn} />
          <input type="submit" style={{ display: 'none' }} />
        </div>}
        {!this.props.loading && <div className="forgot-password">
          <a onClick={() => this.props.setPage(3)}>
            Forgot password?
          </a>
        </div>}
        <Divider style={style} />
        {!this.props.loading && <div className="redirect-signup">
          Don't have an account yet?&nbsp;&nbsp;
          <a onClick={() => this.props.setPage(2)}>
            Sign Up
          </a>
        </div>}
        {this.props.loading && <CircularProgress
          size={0.5}
          color="#aaa"
          style={{ marginTop: '10px' }}
          className="circular-progress"
        />}
      </form>
    </div>);
  }
}
