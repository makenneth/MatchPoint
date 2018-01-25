import React, { Component } from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import { connect } from 'react-redux';

import './styles.scss';

@connect(({ auth: { club } }) => ({ club }))
export default class Club extends Component {
  render() {
    if (!this.props.club) {
      return (<div className="overlay">
        <div className="loading">
          <CircularProgress size={2} />
        </div>
      </div>);
    }

    return (<div className="app">
      <div className="club-body">
        <div className="club-children">
          { this.props.children }
        </div>
      </div>
    </div>);
  }
}
