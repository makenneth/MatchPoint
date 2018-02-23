import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import MdInfoOutline from 'react-icons/lib/md/info-outline';

export default class PasswordChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: props.user.email || '',
      oldPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      errors: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    const { error, success, isLoading } = nextProps.passwordChange;
    if (this.props.passwordChange.isLoading && !isLoading) {
      if (success) {
        this.props.setMessage('Password has been changed successfully.');
        this.setState({
          email: this.props.user.email || '',
          oldPassword: '',
          newPassword: '',
          newPasswordConfirm: '',
          errors: {},
        });
        if (!success.verified && this.props.user.verified) {
          this.props.push('/club/confirm');
        }
      } else {
        if (
          error.oldPassword || error.newPassword ||
          error.newPasswordConfirm || error.email
        ) {
          this.setState({ errors: error });
        } else {
          this.props.setMessage('Please try again later.');
        }
      }
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

    if (this.state.email !== this.props.user.email) {
      if (this.state.email.length === 0) {
        errors.email = 'Email cannot be left empty';
        isValid = false;
      } else {
        const emailRegex = new RegExp('.+@.+..+', 'i');
        if (!emailRegex.test(this.state.email)) {
          errors.email = 'Not a valid email';
          isValid = false;
        }
      }
    }

    if (this.state.oldPassword.length === 0) {
      errors.oldPassword = 'Old password is required.';
      isValid = false;
    }

    if (this.state.newPassword.length > 0) {
      if (this.state.newPassword.length < 8) {
        errors.newPassword = 'Password has to be longer than 8 characters.';
      }
      if (this.state.newPasswordConfirm.length === 0) {
        errors.newPasswordConfirm = 'Please enter the password again.';
        isValid = false;
      } else if (this.state.newPasswordConfirm !== this.state.newPassword) {
        errors.newPasswordConfirm = 'The new passwords don\'t match.';
        isValid = false;
      }
    }

    if (!isValid) {
      this.setState({ errors });
    }
    return isValid;
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.validate()) {
      this.props.submitChange(
        this.state.oldPassword, this.state.newPassword, this.state.email
      );
    }
  }
  render() {
    const { isLoading } = this.props.passwordChange;
    return (<form>
      <div className="email-input-container">
        <TextField
          floatingLabelText="Email"
          value={this.state.email}
          onChange={e => this.handleChange('email', e.target.value)}
          errorText={this.state.errors.email}
          type="email"
          fullWidth={Boolean(true)}
        />
        <div className="hint-text">
          <MdInfoOutline />
          <div className="tooltip">
            You will be required to re-verify your email address.
          </div>
        </div>
      </div>
      <TextField
        hintText="Old Password"
        floatingLabelText="Old Password"
        value={this.state.oldPassword}
        onChange={e => this.handleChange('oldPassword', e.target.value)}
        errorText={this.state.errors.oldPassword}
        type="password"
        fullWidth={Boolean(true)}
      />
      <TextField
        hintText="New Password"
        floatingLabelText="New Password"
        value={this.state.newPassword}
        onChange={e => this.handleChange('newPassword', e.target.value)}
        errorText={this.state.errors.newPassword}
        type="password"
        fullWidth={Boolean(true)}
      />
      <TextField
        hintText="Retype your password"
        floatingLabelText="Retype your password"
        value={this.state.newPasswordConfirm}
        onChange={e => this.handleChange('newPasswordConfirm', e.target.value)}
        errorText={this.state.errors.newPasswordConfirm}
        type="password"
        fullWidth={Boolean(true)}
      />
      {
        isLoading && <CircularProgress
          size={25}
          thickness={2}
          color="#aaa"
          style={{ marginTop: '20px' }}
        />
      }
      {!isLoading && <RaisedButton
        type="submit"
        label="Change Password"
        backgroundColor="#1565C0"
        labelColor="#FFFFFF"
        style={{ marginTop: '20px' }}
        onClick={this.handleSubmit}
      />}
    </form>);
  }
}
