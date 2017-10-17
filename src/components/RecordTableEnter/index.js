import React from 'react';
import { Table, TableBody, TableHeader,
  TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const style = { paddingLeft: '0' };

const RecordTableEnter = (props) => {
  const { sizeOfGroup, joinedPlayers, results, groupNum } = props;
  return (<Table
    selectable={false}
    multiSelectable={false}
    wrapperStyle={{ minWidth: '650px' }}
  >
    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
      <TableRow>
        {
          [...Array(sizeOfGroup + 2)].map((_, i) => (
            <TableHeaderColumn key={`head${i - 1}`} style={i === 1 ? style : {}}>
              {
                (function mapHeader(x) {
                  switch (x) {
                    case 0:
                      return `Group ${groupNum}`;
                    case 1:
                      return 'Name';
                    default:
                      return `vs. ${(i - 1)}`;
                  }
                }(i))
              }
            </TableHeaderColumn>
          ))
        }
      </TableRow>
    </TableHeader>
    <TableBody displayRowCheckbox={false}>
      {
        [...Array(sizeOfGroup)].map((_, m) => {
          const curPlayer = joinedPlayers[m] || {};
          return (<TableRow key={`row${m}`}>{[...Array(sizeOfGroup + 2)].map((__, n) => {
            let content;
            let cellStyle;
            let disabled = false;
            (function mapContent(i, j) {
              switch (i) {
                case 0:
                  content = j + 1;
                  break;
                case j + 2:
                  content = null;
                  disabled = true;
                  break;
                case 1:
                  content = (<h3>
                    {curPlayer.name}<br />
                    {`Rating: ${curPlayer.rating}`}
                  </h3>);
                  cellStyle = style;
                  break;
                default: {
                  cellStyle = { paddingLeft: '10px', paddingRight: '10px' };
                  const other = joinedPlayers[i - 2];
                  // we only want uni-directional change
                  // and only reflect the counter part on the screen
                  if ((i - 2) > j) {
                    content = (<div className="score-div">
                      <SelectField
                        style={{ marginRight: '5px', width: '50%' }}
                        key={`row${j}:${i}-1`}
                        onChange={(e, idx, val) =>
                          props.updateResult(curPlayer.id, other.id, 0, val)
                        }
                        value={results[curPlayer.id][other.id][0]}
                      >
                        <MenuItem value={0} primaryText="0" />
                        <MenuItem value={1} primaryText="1" />
                        <MenuItem value={2} primaryText="2" />
                        <MenuItem
                          value={3}
                          primaryText="3"
                          disabled={results[curPlayer.id][other.id][1] === 3}
                        />
                      </SelectField>
                      <SelectField
                        style={{ width: '50%' }}
                        key={`row${j}:${i}-2`}
                        onChange={
                          (e, idx, val) => props.updateResult(curPlayer.id, other.id, 1, val)
                        }
                        value={results[curPlayer.id][other.id][1]}
                      >
                        <MenuItem value={0} primaryText="0" />
                        <MenuItem value={1} primaryText="1" />
                        <MenuItem value={2} primaryText="2" />
                        <MenuItem
                          value={3}
                          primaryText="3"
                          disabled={results[curPlayer.id][other.id][0] === 3}
                        />
                      </SelectField>
                    </div>);
                  } else {
                    content = (<div>
                      <SelectField
                        style={{ marginRight: '5px', width: '50%' }}
                        key={`row${j}:${i}-1`}
                        value={results[other.id][curPlayer.id][1]}
                        disabled
                      >
                        <MenuItem value={0} primaryText="0" />
                        <MenuItem value={1} primaryText="1" />
                        <MenuItem value={2} primaryText="2" />
                        <MenuItem value={3} primaryText="3" />
                      </SelectField>
                      <SelectField
                        style={{ width: '50%' }}
                        key={`row${j}:${i}-2`}
                        value={results[other.id][curPlayer.id][0]}
                        disabled
                      >
                        <MenuItem value={0} primaryText="0" />
                        <MenuItem value={1} primaryText="1" />
                        <MenuItem value={2} primaryText="2" />
                        <MenuItem value={3} primaryText="3" />
                      </SelectField>
                    </div>);
                  }
                  break;
                }
              }
            }(n, m));
            return (
              <TableRowColumn style={cellStyle} key={`row${m}:${n}`} disabled={disabled}>
                {content}
              </TableRowColumn>
            );
          })
        }</TableRow>);
        })
      }
    </TableBody>
  </Table>);
};

export default RecordTableEnter;
