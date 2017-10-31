import React, { Component } from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import { connect } from 'react-redux';
import { openNewModal } from 'redux/modules/modals';
import { openUpload } from 'redux/modules/upload';
import { startTutorial } from 'redux/modules/tutorial';
import { setDate, registerPlayer, unregisterPlayer } from 'redux/modules/newSession';
// import { saveTempSession, getTempSession, restoreTempSession } from 'redux/modules/tempSession';
import { updateSchemata } from 'redux/modules/schemata';
import Grouping from './Grouping';
import Participants from './Participants';

@connect(
  ({ newSession, activePlayers }) => ({
    date: newSession.date,
    allPlayers: newSession.allPlayers,
    addedPlayers: newSession.addedPlayers,
    activePlayers: activePlayers ? activePlayers.players : [],
  }),
  ({
    openNewModal,
    registerPlayer,
    unregisterPlayer,
    setDate,
    openUpload,
    startTutorial,
    updateSchemata,
    // saveTempSession,
    // restoreTempSession,
  })
)
export default class TabContainer extends Component {
  state = {
    tab: 0,
    sortedPlayers: [],
  };

  componentWillMount() {
    this.setState({ sortedPlayers: this.props.addedPlayers.sort() });
  }

  componentDidMount() {
    if (!this.props.editingId) {
      this.props.startTutorial('registration');
    }
    // const tempSession = getTempSession();
    // if (tempSession) {
    //   this.props.restoreTempSession();
    // }
    // this.int = setInterval(() => {
    //   this.props.saveTempSession();
    // }, 30000);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.addedPlayers !== nextProps.addedPlayers) {
      this.setState({ sortedPlayers: nextProps.addedPlayers.sort() });
    }
  }

  componentWillUnmount() {
    if (this.int) clearInterval(this.int);
  }

  toggleTab = (tab) => {
    if (tab.target) return;
    if (tab === 1) {
      this.props.startTutorial('grouping');
      this.props.updateSchemata(this.props.addedPlayers.length());
    }
    if (tab === 0) this.props.startTutorial('registration');
    this.setState({ tab });
  }

  render() {
    const today = new Date();
    const minDate = new Date(today.setYear(today.getFullYear() - 1));

    const playerContent = (<div>
      <RaisedButton
        className="new-player-button"
        onClick={this.props.openNewModal}
        label="New Player"
        secondary={Boolean(true)}
        style={{
          position: 'absolute', right: 0,
        }}
      />
      <RaisedButton
        className="upload-player-button"
        onClick={this.props.openUpload}
        label="Upload Players"
        secondary={Boolean(true)}
        style={{
          position: 'absolute', right: '150px',
        }}
      />
      <div className="date" style={{ cursor: 'pointer' }}>
        <DatePicker
          className="session-date-picker"
          floatingLabelText="Date of Session"
          hintText="Date" value={this.props.date}
          onChange={(_, date) => this.props.setDate(date)}
          minDate={minDate}
        />
      </div>
      <Participants
        registerPlayer={this.props.registerPlayer}
        unregisterPlayer={this.props.unregisterPlayer}
        sortedPlayers={this.state.sortedPlayers}
        addedPlayers={this.props.addedPlayers}
        allPlayers={this.props.allPlayers}
        activePlayers={this.props.activePlayers}
      />
    </div>);

    return (<Tabs
      tabItemContainerStyle={{ backgroundColor: 'white' }}
      contentContainerStyle={{
        padding: '20px',
        minHeight: '400px',
        backgroundColor: 'white',
      }}
      value={this.state.tab}
      onChange={this.toggleTab}
    >
      <Tab label="Registration" value={0} className="registration-tab tab-menu-tab">
        {playerContent}
      </Tab>
      <Tab label="Grouping" value={1} className="grouping-tab tab-menu-tab">
        <Grouping
          sortedPlayers={this.state.sortedPlayers}
          addedPlayers={this.props.addedPlayers}
          editingId={this.props.editingId}
        />
      </Tab>
    </Tabs>);
  }
}
