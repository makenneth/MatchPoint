import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tutorial } from 'components';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SnackBar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import { clearMessage } from 'redux/modules/main';
import Navbar from './Navbar';

import './styles.scss';

@connect(
  ({ main: { loading, message, spinnerMode } }) =>
    ({ loading, message, spinnerMode }),
  { clearMessage }
)
export default class Main extends React.PureComponent {
  static contextTypes = {
    router: PropTypes.any,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.message) {
      setTimeout(this.props.clearMessage, 8000);
    }
  }

  render() {
    return (<MuiThemeProvider>
      <div className="app-container">
        <Navbar pathname={this.props.location.pathname} />
        {this.props.children}
        {
          this.props.loading &&
            (<div
              className={`overlay${this.props.spinnerMode === 'transparent' ? ' transparent' : ''}`}
            >
              <div className="loading">
                <CircularProgress size={50} />
              </div>
            </div>)
        }
        <SnackBar
          open={!!this.props.message}
          onRequestClose={this.handleClose}
          message={this.props.message || ''}
          autoHideDuration={8000}
        />
        <Tutorial
          router={this.context.router}
          pathname={this.props.location.pathname}
        />
      </div>
    </MuiThemeProvider>);
  }
}
