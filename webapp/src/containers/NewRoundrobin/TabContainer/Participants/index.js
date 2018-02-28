import React from 'react';
import Divider from 'material-ui/Divider';
import { PlayerList, SelectedPlayerList } from 'components';

const style = { position: 'relative' };

class Participants extends React.PureComponent {
  render() {
    return (<div className="player-lists">
      <Divider style={style} />
      <PlayerList
        players={this.props.allPlayers}
        title="All Players"
        addedPlayers={this.props.addedPlayers}
        registerPlayer={this.props.registerPlayer}
        unregisterPlayer={this.props.unregisterPlayer}
        activePlayers={this.props.activePlayers}
      />
      <Divider style={style} />
      <SelectedPlayerList
        players={this.props.sortedPlayers}
        title="Selected Players"
        addedPlayers={this.props.addedPlayers}
        unregisterPlayer={this.props.unregisterPlayer}
      />
      <Divider style={style} />
    </div>);
  }
}

export default Participants;
