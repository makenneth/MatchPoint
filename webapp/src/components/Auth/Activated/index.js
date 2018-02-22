import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { connect } from 'react-redux';
import { activateClub } from 'redux/modules/auth';

@connect(() => ({}), { activateClub })
export default class Activated extends Component {
  render() {
    return (<div className="forms activated" style={{ top: '50%' }}>
      <form onSubmit={(e) => e.preventDefault()}>
        <p>{this.props.message}</p>
        <RaisedButton
          style={{ marginTop: '10px' }}
          label="Back to Main Page"
          backgroundColor="#EF6C00"
          labelColor="#FFFFFF"
          onClick={() => {
            if (this.props.homepage) {
              this.props.setPage(0);
            } else {
              this.props.activateClub();
            }
          }}
        />
      </form>
    </div>);
  }
}
