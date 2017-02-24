import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import moment from 'moment';
import AppBar from 'material-ui/AppBar';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import { ViewRecordTable } from 'containers';

export default class ViewSession extends Component {
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

  handleClose = () => {
    this.setState({ open: false });
  }
  handleBack = () => {
    browserHistory.push('/club/sessions');
  }
  render() {
    const { session: { date, selectedSchema, players }, scoreChange } = this.props;

    let countedPlayers = 0;
    return (<div className="session-container">
      <AppBar
        className="app-bar"
        title={`Date: ${moment(date).utc().format('MMMM DD, YYYY')}`}
        iconElementLeft={<IconButton onClick={this.handleBack}><NavigationClose /></IconButton>}
      />
      <div className="session-container-body">
        {
          selectedSchema.map((sizeOfGroup, i) => {
            countedPlayers += +sizeOfGroup;
            return (<ViewRecordTable
              key={i}
              groupNum={i + 1}
              start={countedPlayers - sizeOfGroup}
              joinedPlayers={players}
              sizeOfGroup={+sizeOfGroup}
              scoreChange={scoreChange[i] || []}
            />);
          })
        }
      </div>
    </div>);
  }
}
