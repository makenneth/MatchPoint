import React from 'react';
import { Table, TableBody, TableHeader,
  TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const style = { paddingLeft: '0' };

class RecordTableEnter extends React.PureComponent {
  renderHeaderColumn(key, content, headerStyle = {}) {
    return (
      <TableHeaderColumn key={key} style={headerStyle}>
        {content}
      </TableHeaderColumn>
    );
  }

  renderHeader() {
    const { sizeOfGroup, groupNum, editable } = this.props;

    const columns = [];
    for (let i = 0; i < sizeOfGroup + 2; i++) {
      if (i === 0) {
        columns.push(this.renderHeaderColumn(i, `Group ${groupNum}`));
      } else if (i === 1) {
        columns.push(this.renderHeaderColumn(i, 'Name', style));
      } else {
        columns.push(this.renderHeaderColumn(
          i, `vs. ${(i - 1)}`, !editable ? { textAlign: 'center' } : undefined,
        ));
      }
    }
    return (
      <TableRow>{columns}</TableRow>
    );
  }

  renderBody() {
    const rows = [];
    for (let i = 0; i < this.props.sizeOfGroup; i++) {
      rows.push(this.renderBodyRow(i));
    }
    return rows;
  }

  renderBodyRow(row) {
    const { joinedPlayers, sizeOfGroup } = this.props;
    const curPlayer = joinedPlayers[row];
    const columns = [];
    for (let i = 0; i < sizeOfGroup + 2; i++) {
      let cellStyle;
      let disabled = false;
      let content;
      if (i === 0) {
        content = row + 1;
      } else if (i === 1) {
        content = (<h3>
          {curPlayer.name}<br />
          {`Rating: ${curPlayer.rating}`}
        </h3>);
        cellStyle = style;
      } else if (i === row + 2) {
        content = null;
        disabled = true;
      } else {
        cellStyle = { paddingLeft: '10px', paddingRight: '10px' };
        const other = joinedPlayers[i - 2];
        if (this.props.editable) {
          content = this.renderColumnInputField(row, i, curPlayer, other);
        } else {
          content = this.renderColumnResultDisplay(row, i, curPlayer, other);
        }
      }

      columns.push(this.renderBodyRowColumn(row, i, content, disabled, cellStyle));
    }

    return (
      <TableRow key={row}>
        {columns}
      </TableRow>
    );
  }

  renderBodyRowColumn(row, col, content, disabled = false, colStyle = {}) {
    return (<TableRowColumn style={colStyle} key={`${row}-${col}`} disabled={disabled}>
      {content}
    </TableRowColumn>);
  }

  renderColumnResultDisplay(row, col, curPlayer, other) {
    const { results } = this.props;
    return (<div className="score-div view">
      <span>
        {results[curPlayer.id][other.id][0]}
      </span>
      <span>
        {results[curPlayer.id][other.id][1]}
      </span>
    </div>);
  }

  renderColumnInputField(row, col, curPlayer, other) {
    const { results } = this.props;

    if ((col - 2) > row) {
      return (<div className="score-div">
        <SelectField
          style={{ marginRight: '5px', width: '50%' }}
          key="1"
          onChange={(e, idx, val) =>
            this.props.updateResult(curPlayer.id, other.id, 0, val)
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
          key="2"
          onChange={
            (e, idx, val) =>
              this.props.updateResult(curPlayer.id, other.id, 1, val)
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
    }
    return (<div>
      <SelectField
        style={{ marginRight: '5px', width: '50%' }}
        key="1"
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
        key="2"
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

  render() {
    return (<Table
      selectable={false}
      multiSelectable={false}
      wrapperStyle={{ minWidth: '650px' }}
    >
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        {this.renderHeader()}
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
        {this.renderBody()}
      </TableBody>
    </Table>);
  }
}

export default RecordTableEnter;
