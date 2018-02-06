import React, { Component } from 'react';
// import { browserHistory } from 'react-router';
// import moment from 'moment';
// import CircularProgress from 'material-ui/CircularProgress';
import HoursTable from './HoursTable';
// import './styles.scss';

export default class OperationInfo extends Component {
  render() {
    const { operationHours, roundrobinHours, isLoading } = this.props.hoursState;
    // so it should show what is already set...
    // then there will be an edit button that will pop a modal up
    return (<div className="contact-info-container">
      <HoursTable
        title="Operation Hours"
        type="operation"
        hours={operationHours}
        isLoading={isLoading}
        updateClubHour={this.props.updateClubHour}
        addClubHour={this.props.addClubHour}
        deleteClubHour={this.props.deleteClubHour}
        hourState={this.props.hourState}
      />
      <HoursTable
        title="Round Robin Hours"
        type="roundrobin"
        hours={roundrobinHours}
        isLoading={isLoading}
        updateClubHour={this.props.updateClubHour}
        addClubHour={this.props.addClubHour}
        deleteClubHour={this.props.deleteClubHour}
        hourState={this.props.hourState}
      />
    </div>);
  }
}
