import React from 'react';
import { Table, TableBody, TableRow,
  TableHeader, TableHeaderColumn, TableRowColumn } from 'material-ui/Table';
import UpArrow from 'react-icons/lib/md/keyboard-arrow-up';
// import PromoteButton from 'react-icons/lib/fa/arrow-up';
import DownArrow from 'react-icons/lib/md/keyboard-arrow-down';
// import DemoteButton from 'react-icons/lib/fa/arrow-down';
import IconButton from 'material-ui/IconButton/IconButton';

const ParticipantGroup = (props) => {
  const { promotedPlayers = {} } = props;
  return (<div style={{ position: 'relative' }} className="participant-group-tables">
    <Table
      selectable={false}
      multiSelectable={false}
      fixedHeader={Boolean(true)}
    >
      <TableHeader
        displaySelectAll={false}
        enableSelectAll={false}
        adjustForCheckbox={false}
      >
        <TableRow>
          <TableHeaderColumn>Group {props.groupId + 1}</TableHeaderColumn>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Rating</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody
        displayRowCheckbox={false}
        showRowHover={Boolean(true)}
        style={{ position: 'relative' }}
      >
        {
          props.players.map((player = {}, i) => (
            <TableRow className="table-row" key={player.id}>
              <TableRowColumn
                style={{ color: promotedPlayers[player.id] ? 'rgb(255, 64, 129)' : 'default' }}
              >
                {i + 1}
              </TableRowColumn>
              <TableRowColumn
                style={{ color: promotedPlayers[player.id] ? 'rgb(255, 64, 129)' : 'default' }}
              >
                {player.name}
              </TableRowColumn>
              <TableRowColumn
                style={{ color: promotedPlayers[player.id] ? 'rgb(255, 64, 129)' : 'default' }}
              >
                {player.rating}
                {
                  // props.promote &&
                  //   <IconButton
                  //     iconClassName="material-icons"
                  //     tooltip="Promote Player"
                  //     onClick={() => props.promote(props.groupId, i)}
                  //     style={{
                  //       left: '15px',
                  //       zIndex: 10,
                  //     }}
                  //   >
                  //     <PromoteButton />
                  //   </IconButton>
                }
                {
                  // props.demote &&
                  // <IconButton
                  //   iconClassName="material-icons"
                  //   tooltip="Demote Player"
                  //   onClick={() => props.demote(props.groupId, i)}
                  //   style={{
                  //     left: '30px',
                  //     zIndex: 10,
                  //   }}
                  // >
                  //   <DemoteButton />
                  // </IconButton>
                }
              </TableRowColumn>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
    {
      !!props.moveUp &&
        (<IconButton
          iconClassName="material-icons"
          tooltip="Move one player up"
          onClick={() => props.moveUp(props.groupId)}
          style={{
            position: 'absolute',
            left: '30px',
            top: '57px',
            zIndex: 10,
          }}
        >
          <UpArrow />
        </IconButton>)
    }
    {
      !!props.moveDown &&
        (<IconButton
          iconClassName="material-icons"
          tooltip="Move one player down"
          onClick={() => props.moveDown(props.groupId)}
          style={{
            position: 'absolute',
            left: '30px',
            bottom: '1px',
            zIndex: 10,
          }}
        >
          <DownArrow />
        </IconButton>)
    }
  </div>);
};

export default ParticipantGroup;
