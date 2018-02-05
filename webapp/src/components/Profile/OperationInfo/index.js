import React, { Component } from 'react';
// import { browserHistory } from 'react-router';
// import moment from 'moment';
// import CircularProgress from 'material-ui/CircularProgress';
import HoursTable from './HoursTable';
// import './styles.scss';

export default class ContactInfo extends Component {
  render() {
    const { isLoading } = this.props.contactChange || {};
    const { clubHours, roundrobinHours } = this.props;
    // so it should show what is already set...
    // then there will be an edit button that will pop a modal up
    return (<div className="contact-info-container">
      <HoursTable
        title="Operation Hours"
        hours={clubHours}
        isLoading={isLoading}
        handleSubmit={this.props.updateHours}
      />
      <HoursTable
        title="Round Robin Hours"
        hours={roundrobinHours}
        isLoading={isLoading}
        handleSubmit={this.props.updateHours}
      />
    </div>);
  }
}
