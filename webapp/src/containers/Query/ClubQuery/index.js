import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import SelectField from 'material-ui/SelectField';
import { Card } from 'material-ui/Card';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import MdOpenInNew from 'react-icons/lib/md/open-in-new';
import KeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down';
import KeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up';
import moment from 'moment';
import {
  setClub, setDate,
  fetchRoundRobinDetail,
} from 'redux/modules/query';
import { ClubQueryDetail } from 'components';
import AggregationTool from '../AggregateTool';

@connect(
  ({ query }) => ({ query }),
  { setClub, setDate, fetchRoundRobinDetail }
)
export default class ClubQuery extends React.PureComponent {
  state = {
    page: null,
  };

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

  handleCardOpen = (i) => {
    this.setState((prevState) => ({
      page: prevState.page === i ? null : i,
    }));
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
                primaryText={clubs[id].clubName}
              />
            ))
          }
        </SelectField>
        {selectedClub && <Link to={`/clubs/${selectedClub.id}`}>
          <span style={{ marginRight: '5px' }}>Go To Club Page</span>
          <MdOpenInNew />
        </Link>}
      </div>
      <Card className={`club-query-section${this.state.page !== 0 ? ' collapsed' : ''}`}>
        <h2 className="club-query-section--title">
          <span>Results</span>
          <span onClick={() => this.handleCardOpen(0)}>
            {this.state.page !== 0 && <KeyboardArrowDown className="icons" />}
            {this.state.page === 0 && <KeyboardArrowUp className="icons" />}
          </span>
        </h2>
        <div className={`club-query-section--body${this.state.page !== 0 ? ' collapsed' : ''}`}>
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
          <div className="club-result-body">
            {
              selectedClub && (<div className="club-info-container">
                <div>{selectedRoundrobin && moment(selectedRoundrobin.date).utc().format('MMMM DD, YYYY')}</div>
              </div>)
            }
            <ClubQueryDetail
              roundrobin={selectedRoundrobin}
              clubSelected={selected}
              resultsAvailable={resultsAvailable}
            />
          </div>
        </div>
      </Card>
      <Card className={`club-query-section${this.state.page !== 1 ? ' collapsed' : ''}`}>
        <h2 className="club-query-section--title">
          <span>Aggregation</span>
          <span onClick={() => this.handleCardOpen(1)}>
            {this.state.page !== 1 && <KeyboardArrowDown className="icons" />}
            {this.state.page === 1 && <KeyboardArrowUp className="icons" />}
          </span>
        </h2>
        <div className={`club-query-section--body${this.state.page !== 1 ? ' collapsed' : ''}`}>
          {!selected && <div className="hint-text">Select a Club first</div>}
          {
            selected && <AggregationTool clubId={selected} />
          }
        </div>
      </Card>
      {loading && <div className="overlay transparent">
        <CircularProgress
          color="#555"
          size={30}
          style={{
            margin: '0',
            position: 'absolute',
            transform: 'translate(-50%)',
            top: '50%',
            left: '50%',
          }}
        />
      </div>}
    </div>);
  }
}
