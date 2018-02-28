import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import { connect } from 'react-redux';

import './styles.scss';

@connect(({ auth: { user } }) => ({ user }))
export default class Club extends React.PureComponent {
  render() {
    if (!this.props.user) {
      return (<div className="overlay">
        <div className="loading">
          <CircularProgress size={50} color="e0e0e0" />
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
