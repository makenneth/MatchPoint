import React, { Component } from 'react';
import { connect } from 'react-redux';
import { resendEmail } from 'redux/modules/profile';
import { setMessage } from 'redux/modules/main';

import './styles.scss';

@connect(() => ({}), { resendEmail, setMessage })
export default class Confirmation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resent: false,
    };
  }

  resend = () => {
    if (!this.state.resent) {
      this.props.resendEmail();
      this.setState({ resent: true });
      setTimeout(() => {
        this.setState({ resent: false });
      }, 30000);
    } else {
      this.props.setMessage('Please wait 30 seconds before retrying');
    }
  }
  render() {
    return (
      <div className="confirmation-sent">
        <div className="confirmation-container">
          <h3>Confirmation Needed</h3>
          <p>We've sent you a confirmation email with a link to actviate your account.</p>
          <p>Did not receive the email&#63;<a onClick={this.resend}>Resend</a></p>
        </div>
      </div>
    );
  }
}
