import React from 'react';
import { Table, TableBody, TableHeader,
  TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

const SelectedPlayerList = (props) => {
  const idRef = {};
  const playerList = props.players.map((player, i) => {
    idRef[i] = player.id;
    return (<TableRow key={player.id} selected={!!props.addedPlayers.find(player.id)}>
      <TableRowColumn>{player.name}</TableRowColumn>
      <TableRowColumn>{player.rating}</TableRowColumn>
    </TableRow>);
  });

  return (
    <div>
      <h3 className="table-title" style={{ marginBottom: '72px' }}>
        {`${props.title} (${props.players.length})`}
      </h3>
      <Table
        height="400px"
        style={{ backgroundColor: 'transparent' }}
        wrapperStyle={{ backgroundColor: 'transparent' }}
        fixedHeader={Boolean(true)}
        selectable={Boolean(true)}
        multiSelectable={Boolean(true)}
        onCellClick={i => props.unregisterPlayer(idRef[i])}
      >
        <TableHeader displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Rating</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckBox={false}
          showRowHover={Boolean(true)}
          deselectOnClickaway={false}
        >
          {playerList}
        </TableBody>
      </Table>
    </div>
  );
};

export default SelectedPlayerList;
