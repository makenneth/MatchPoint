import React from 'react';
import HoursTable from './HoursTable';
import InfoForm from './InfoForm';
import ClubNotes from './ClubNotes';
import './styles.scss';

export default class OperationInfo extends React.PureComponent {
  render() {
    const { operationHours, roundrobinHours, isLoading } = this.props.hoursState;

    return (<div className="contact-info-container">
      <InfoForm
        infoChange={this.props.infoChange}
        autocomplete={this.props.autocomplete}
        user={this.props.user}
        submitChange={this.props.changeInfo}
        setMessage={this.props.setMessage}
        addressAutoComplete={this.props.addressAutoComplete}
        clearPredictions={this.props.clearPredictions}
      />
      <ClubNotes
        clubNotes={this.props.clubNotes}
        setMessage={this.props.setMessage}
        notes={this.props.user.notes}
        handleSubmit={this.props.updateClubNote}
      />
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
