import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tutorial } from 'components';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SnackBar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import { clearMessage } from 'redux/modules/main';
import Navbar from './Navbar';

import './styles.scss';

@connect(({ main: { loading, message } }) => ({ loading, message }), { clearMessage })
export default class Main extends Component {
  static contextTypes = {
    router: React.PropTypes.any,
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
            (<div className="overlay">
              <div className="loading">
                <CircularProgress size={2} />
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
