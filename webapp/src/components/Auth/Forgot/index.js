import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import { connect } from 'react-redux';
import { resetPasswordRequest } from 'redux/modules/reset';

@connect(({ reset }) => ({ reset }), { resetPasswordRequest })
export default class Forgot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      field: 'testuser',
      error: '',
      success: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.reset.isLoading && !nextProps.reset.isLoading) {
      if (nextProps.reset.error) {
        this.setState({ error: nextProps.reset.error });
      } else {
        this.setState({
          field: '',
          success: 'An email has been sent to your email with instructions to reset your password.',
        });
      }
    }
  }

  updateField = (ev) => {
    this.setState({ field: ev.target.value, error: null });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = new RegExp('.+@.+..+', 'i');
    if (!emailRegex.test(this.state.field)) {
      this.props.resetPasswordRequest('username', this.state.field);
    } else {
      this.props.resetPasswordRequest('email', this.state.field);
    }
  }

  render() {
    const { isLoading } = this.props.reset;
    return (<div className="forms">
      <form onSubmit={this.handleSubmit}>
        {
          !this.state.success && <h3>Forgot Password</h3>
        }
        <h4>{this.state.success}</h4>
        {
          this.state.success &&
            (<RaisedButton
              label="Back to Main Page"
              backgroundColor="#EF6C00"
              labelColor="#FFFFFF"
              onClick={() => this.props.setPage(0)}
            />)
        }
        {
          !this.state.success &&
            (<div>
              <TextField
                type="text"
                hintText="Enter your username or email"
                floatingLabelText="Enter your username or email"
                errorText={this.state.error}
                value={this.state.field}
                fullWidth={Boolean(true)}
                onChange={this.updateField}
              />
              {!isLoading && <RaisedButton
                label="Reset Password"
                backgroundColor="#1565C0"
                labelColor="#FFFFFF"
                style={{ marginTop: '10px' }}
                onClick={this.handleSubmit}
              />}
              {
                isLoading && <CircularProgress
                  size={0.5}
                  color="#aaa"
                  style={{ marginTop: '10px' }}
                />
              }
            </div>)
        }
      </form>
    </div>);
  }
}
