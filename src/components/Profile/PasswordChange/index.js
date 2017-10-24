import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

export default class PasswordChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
          oldPassword: '',
          newPassword: '',
          newPasswordConfirm: '',
          errors: {},
        });
      } else {
        if (error.oldPassword || error.newPassword || error.newPasswordConfirm) {
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

    if (this.state.oldPassword.length === 0) {
      errors.oldPassword = 'Please fill in your old password.';
      isValid = false;
    }

    if (this.state.newPassword.length < 8) {
      errors.newPassword = 'The new password has to be at least 8 characters long.';
      isValid = false;
    }

    if (this.state.newPasswordConfirm !== this.state.newPassword) {
      errors.newPasswordConfirm = "The new passwords don't match.";
      isValid = false;
    }

    if (!isValid) {
      this.setState({ errors });
    }
    return isValid;
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.validate()) {
      this.props.submitChange(this.state.oldPassword, this.state.newPassword);
    }
  }
  render() {
    const { isLoading } = this.props.passwordChange;
    return (<form>
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
          size={0.5}
          color="#aaa"
        />
      }
      {!isLoading && <RaisedButton
        type="submit"
        label="Change Password"
        backgroundColor="#1565C0"
        labelColor="white"
        style={{ marginTop: '20px' }}
        onClick={this.handleSubmit}
      />}
    </form>);
  }
}
