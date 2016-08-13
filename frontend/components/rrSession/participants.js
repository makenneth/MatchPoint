import React from 'react';
import PlayerList from './playerList';
import Divider from 'material-ui/Divider';

const PlayerGroup = (props) => {
  return (<div className="player-lists">
      <Divider />
      <PlayerList players={props.allPlayers}
                  handleToggle={props.handleToggle}
                  title="All Players"
                  selectable={true} 
                  addedPlayers={props.objAddedPlayers}/>
      <Divider />    
      <PlayerList players={props.addedPlayers} 
                  handleToggle={props.handleToggle}
                  title="Selected Players"
                  selectable={false}
                  addedPlayers={props.objAddedPlayers}/>   
      <Divider />    
  </div>);
}


export default PlayerGroup;
