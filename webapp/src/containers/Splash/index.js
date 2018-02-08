import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setPage } from 'redux/modules/splash';
import { setToken } from 'redux/modules/reset';
import { LogInForm, SignUpForm, ForgotForm, ResetForm, Activated } from 'components';
import { asyncConnect } from 'redux-async-connect-react16';
import RaisedButton from 'material-ui/RaisedButton';

import './styles.scss';

@asyncConnect([{
  promise: ({ store, location }) => {
    if (location.pathname === '/reset') {
      const promises = [store.dispatch(setPage(4))];
      if (location.query.token) {
        promises.push(store.dispatch(setToken(location.query.token)));
      }
      return Promise.all(promises);
    } else if (location.pathname === '/activate/success') {
      return Promise.resolve(store.dispatch(setPage(5)));
    } else if (location.pathname === '/activate/error') {
      return Promise.resolve(store.dispatch(setPage(6)));
    }
    return null;
  },
}])
@connect(({ splash: { page } }) => ({ page }), { setPage })
class Splash extends Component {
  componentWillUnmount() {
    this.props.setPage(0);
  }
  render() {
    const content = (() => {
      switch (this.props.page) {
        case 1:
          return <LogInForm setPage={this.props.setPage} />;
        case 2:
          return <SignUpForm setPage={this.props.setPage} />;
        case 3:
          return <ForgotForm setPage={this.props.setPage} />;
        case 4:
          return <ResetForm setPage={this.props.setPage} />;
        case 5:
          return (<Activated
            setPage={this.props.setPage}
            message="Your account has been activated successfully."
          />);
        case 6:
          return (<Activated
            setPage={this.props.setPage}
            homepage={Boolean(true)}
            message="The token has expired or your account has already been activated."
          />);
        default:
          return (<div className="banner-text">
            <p>
              Having a Round Robin Tournament? <br />
              Find all your players and results in one spot
            </p>
            <div className="buttons">
              <RaisedButton
                className="login-button"
                onClick={() => this.props.setPage(1)}
                label="Log In"
                backgroundColor="#0E3652"
                labelColor="white"
                style={{ backgroundColor: '#0E3652' }}
              />
              <RaisedButton
                className="login-button"
                onClick={() => this.props.setPage(2)}
                label="Sign Up"
                backgroundColor="#0E5249"
                labelColor="white"
                style={{ backgroundColor: '#0E5249' }}
              />
            </div>
          </div>);
      }
    })();

    return (<div className="banner-container">
      {content}
    </div>
    );
  }
}

export default Splash;
