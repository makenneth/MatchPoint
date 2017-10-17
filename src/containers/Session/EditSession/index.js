import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import moment from 'moment';
import AppBar from 'material-ui/AppBar';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { EditRecordTable } from 'containers';

export default class EditSession extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0,
      open: false,
    };
  }

  setTab = (currentTab) => {
    this.setState({ currentTab });
  }

  saveSession = () => {
    const session = this.props.session;
    if (!session.finalized) {
      this.props.postResult(session.short_id, session.date, this.props.results);
    }
  }
  handleClose = () => {
    this.setState({ open: false });
  }
  handleDelete = () => {
    this.props.deleteSession(this.props.id);
    browserHistory.push('/club/sessions');
  }
  handleBack = () => {
    browserHistory.push('/club/sessions');
  }
  iconMenu() {
    return (<IconMenu
      iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
    >
      <MenuItem primaryText="Save" onClick={this.saveSession} />
      <MenuItem primaryText="Delete" onClick={() => this.setState({ open: true })} />
    </IconMenu>);
  }
  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={Boolean(true)}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Delete"
        secondary={Boolean(true)}
        keyboardFocused={Boolean(true)}
        onTouchTap={this.handleDelete}
      />,
    ];
    const { session: { date, selected_schema: selectedSchema, players, finalized } } = this.props;
    let countedPlayers = 0;
    return (<div className="session-container">
      <AppBar
        className="app-bar"
        title={`Date: ${moment(date).utc().format('MMMM DD, YYYY')}`}
        iconElementLeft={
          <IconButton
            onClick={this.handleBack}
            className="closeIcon"
          >
            <NavigationClose />
          </IconButton>
        }
        iconElementRight={this.iconMenu()}
      />
      <div className="session-container-body">
        {
          selectedSchema.map((sizeOfGroup, i) => {
            const joinedPlayers = players.slice(
              countedPlayers,
              countedPlayers + sizeOfGroup
            );
            countedPlayers += +sizeOfGroup;
            return (<EditRecordTable
              key={i}
              groupNum={i + 1}
              finalized={finalized}
              joinedPlayers={joinedPlayers}
              sizeOfGroup={+sizeOfGroup}
              results={this.props.results}
              updateScore={this.props.updateScore}
              updateResult={this.props.updateResult}
              sortedPlayerList={this.props.sortedPlayerList[i]}
              ratingChange={this.props.ratingChange}
              ratingChangeDetail={this.props.ratingChangeDetail}
            />);
          })
        }
      </div>
      <Dialog
        title="Delete Session"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
      >
        Are you sure you want to delete this session?
      </Dialog>
    </div>);
  }
}
