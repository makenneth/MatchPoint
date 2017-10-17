import React from 'react';
import { Table, TableBody, TableHeader,
  TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import './styles.scss';

const RecordTableView = (props) => {
  const {
    sizeOfGroup,
    joinedPlayers,
    sortedPlayerList,
    groupNum,
    ratingChange,
    ratingChangeDetail,
  } = props;
  const playerRef = {};
  joinedPlayers.forEach(p => {
    playerRef[p.id] = p;
  });
  return (<Table
    selectable={false}
    multiSelectable={false}
    wrapperStyle={{ minWidth: '1000px' }}
  >
    <TableHeader
      className="record-table-header"
      displaySelectAll={false}
      adjustForCheckbox={false}
      enableSelectAll={false}
    >
      <TableRow>
        {
          [...Array(sizeOfGroup + 8)].map((_, i) => {
            let content;
            let style = {};
            let className;

            switch (i) {
              case 0:
                content = `Group ${groupNum}`;
                style = { paddingLeft: '5px', paddingRight: '5px' };
                break;
              case 1:
                content = 'Name';
                className = 'name';
                style = { paddingLeft: '0' };
                break;
              case 2:
                content = 'Before';
                break;
              case sizeOfGroup + 3:
                content = 'Wins';
                break;
              case sizeOfGroup + 4:
                content = 'Losses';
                break;
              case sizeOfGroup + 6:
                content = 'Bonus';
                break;
              case sizeOfGroup + 5:
                content = 'Change';
                break;
              case sizeOfGroup + 7:
                content = 'After';
                break;
              default:
                content = i - 2;
                break;
            }
            return (<TableHeaderColumn
              key={`head${(i - 1)}`}
              style={style}
              className={className}
            >
              { content }
            </TableHeaderColumn>);
          })
        }
      </TableRow>
    </TableHeader>
    <TableBody displayRowCheckbox={false} className="record-table-body">
      {
        [...Array(sizeOfGroup)].map((__, m) => {
          const self = sortedPlayerList[m];
          const curPlayer = playerRef[self.id] || {};
          let bonus = 0;
          return (<TableRow key={`row${m}`}>{[...Array(sizeOfGroup + 8)].map((_, n) => {
            if (n === 0) {
              return (<TableRowColumn
                key={`row${m}:${n}`}
                style={{ paddingLeft: '5px', paddingRight: '5px' }}
              >
                {(m + 1)}
              </TableRowColumn>);
            }
            if (n === m + 3) return <TableRowColumn key={`row${m}:${n}`}>0</TableRowColumn>;
            let cellContent;
            let style;
            let className;
            switch (n) {
              case 1:
                style = { whiteSpace: 'initial', paddingLeft: '0' };
                cellContent = curPlayer.name;
                className = 'name';
                break;
              case 2:
                cellContent = curPlayer.rating;
                break;
              case sizeOfGroup + 3:
                cellContent = self.wins;
                break;
              case sizeOfGroup + 4:
                cellContent = self.losses;
                break;
              case sizeOfGroup + 6: {
                const change = ratingChange[self.id];
                if (change > 24) {
                  bonus = change - 24;
                }
                cellContent = bonus;
                break;
              }
              case sizeOfGroup + 5:
                cellContent = ratingChange[self.id];
                break;
              case sizeOfGroup + 7:
                cellContent = ratingChange[self.id] + bonus + +curPlayer.rating;
                break;
              default:
                break;
            }
            if (n === sizeOfGroup + 3 ||
              n === sizeOfGroup + 4 ||
              n === sizeOfGroup + 5 ||
              n === sizeOfGroup + 6 ||
              n === sizeOfGroup + 7 ||
              n === 1 ||
              n === 2) {
              return (<TableRowColumn key={`row${m}:${n}`} style={style} className={className}>
                {cellContent}
              </TableRowColumn>);
            }
            const otherId = sortedPlayerList[n - 3] && sortedPlayerList[n - 3].id;
            if (!ratingChangeDetail[self.id] ||
              ratingChangeDetail[self.id][otherId] === undefined) {
              return <TableRowColumn key={`row${m}:${n}`}>0</TableRowColumn>;
            }
            return (<TableRowColumn key={`row${m}:${n}`}>
              {ratingChangeDetail[self.id][otherId]}
            </TableRowColumn>);
          })}</TableRow>);
        })
      }
    </TableBody>
  </Table>);
};

export default RecordTableView;
