import React, { Component } from 'react';
import { connect } from 'react-redux';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import moment from 'moment';
import { setClub, setDate, fetchRoundRobinDetail } from 'redux/modules/query';
import { ClubQueryDetail } from 'components';

@connect(({ query }) => ({ query }), { setClub, setDate, fetchRoundRobinDetail })
export default class ClubQuery extends Component {
  changeDate = (e, i, session) => {
    if (session) {
      const { selectedClub, roundrobins } = this.props.query;
      const selected = selectedClub.id;
      if (selected &&
        (!roundrobins[selected] || !roundrobins[selected][session])) {
        this.props.fetchRoundRobinDetail(selected, session);
      }

      this.props.setDate(session);
    }
  }

  changeClub = (e, idx, clubId) => {
    const { selectedClub } = this.props.query;
    if (!selectedClub || selectedClub.id.toString() !== clubId.toString()) {
      this.props.setClub(clubId);
    }
  }

  render() {
    const { clubs, selectedClub, selectedDate, roundrobins, loading } = this.props.query;
    const selected = selectedClub && selectedClub.id;
    const resultsAvailable = selectedClub && (selectedClub.sessions || []).length > 0;
    // eslint-disable-next-line no-nested-ternary
    const dateLabelText = selected ?
      (resultsAvailable ? 'Select a Date' : 'No results found') :
      'Select a club first';
    const selectedRoundrobin = selectedDate && roundrobins[selectedDate];
    console.log(selected);
    return (<div className="club-result-container">
      <div className="name-select-div">
        <SelectField
          value={selected && selected.toString()}
          onChange={this.changeClub}
          floatingLabelText="Select a Club"
          floatingLabelFixed={Boolean(false)}
          disabled={loading}
        >
          {
            (Object.keys(clubs) || []).map((id, i) => (
              <MenuItem
                key={i}
                value={id}
                primaryText={clubs[id].club_name}
              />
            ))
          }
        </SelectField>
        <SelectField
          value={selectedDate}
          onChange={this.changeDate}
          floatingLabelText={dateLabelText}
          floatingLabelFixed={Boolean(false)}
          disabled={loading}
        >
          {
            ((selectedClub && selectedClub.sessions) || []).map((session, i) => (
              <MenuItem
                key={i}
                value={session.short_id}
                primaryText={moment(session.date).utc().format('MMMM DD, YYYY')}
              />
            ))
          }
        </SelectField>
      </div>
      <div className="club-result-body">
        {
          selectedClub && (<div className="club-info-container">
            <h1>Club: {selectedClub.club_name}</h1>
            <div>Location: {`${selectedClub.city}, ${selectedClub.state}`}</div>
          </div>)
        }
        <ClubQueryDetail
          roundrobin={selectedRoundrobin}
          clubSelected={selected}
          resultsAvailable={resultsAvailable}
        />
        {loading && <div className="overlay">
          <CircularProgress
            color="#555"
            size={1}
            style={{
              margin: '0',
              position: 'absolute',
              transform: 'translate(-50%)',
              top: '50%',
              left: '50%',
            }}
          />
        </div>}
      </div>
    </div>);
  }
}
