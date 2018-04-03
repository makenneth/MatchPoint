import React from 'react';
import { connect } from 'react-redux';
import { fetchRangeAggreationResult } from 'redux/modules/rangeAggregation';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Table, TableBody, TableHeader,
  TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import CircularProgress from 'material-ui/CircularProgress';
import IconButton from 'material-ui/IconButton/IconButton';
import KeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down';
import KeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up';
import SwapVert from 'react-icons/lib/md/swap-vert';
import TrendingUp from 'react-icons/lib/md/trending-up';
import TrendingFlat from 'react-icons/lib/md/trending-flat';
import TrendingDown from 'react-icons/lib/md/trending-down';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Close from 'react-icons/lib/md/close';

@connect(({ rangeAggregation }) => ({ rangeAggregation }), { fetchRangeAggreationResult })
class AggregateQueryTool extends React.PureComponent {
  state = {
    startDate: null,
    endDate: null,
    groups: [],
    isModalOpen: false,
  }

  componentDidUpdate(prevProps, prevState) {
    const { startDate, endDate } = this.state;
    if (prevState.startDate !== startDate ||
      prevState.endDate !== endDate || this.props.clubId !== prevProps.clubId) {
      if (startDate && endDate) {
        this.props.fetchRangeAggreationResult(this.props.clubId, startDate, endDate);
      }
    }
  }

  formatTitle(idx) {
    const { type, condition } = this.state.groups[idx];
    switch (type) {
      case 'between':
        return `Between ${condition[0]} and ${condition[1]}`;
      case 'greater':
        return `Greater than ${condition[0]}`;
      default:
        return `Less than ${condition[0]}`;
    }
  }

  updateDate = (type, event, date) => {
    this.setState({ [`${type}Date`]: date });
  }

  deleteGroup = (i) => {
    this.setState({
      groups: this.state.groups.filter((_, j) => j !== i),
    });
  }

  addGroupingCriteria = (type, condition) => {
    /* type [ between, above, below ] */
    this.setState({
      groups: [
        {
          type,
          condition,
        },
        ...this.state.groups,
      ],
    });
  }

  render() {
    const { rangeAggregation: { isLoading, playerDetail = [] } } = this.props;
    const { startDate, endDate, groups, isModalOpen } = this.state;
    const aggregateGroups = groups.map(({ type, condition }) => {
      let cb;
      switch (type) {
        case 'between':
          cb = (player) => {
            const [from, to] = condition;
            return from <= player.rating && player.rating <= to;
          };
          break;

        case 'greater':
          cb = (player) => {
            const [value] = condition;
            return player.rating >= value;
          };
          break;

        case 'less':
          cb = (player) => {
            const [value] = condition;
            return player.rating <= value;
          };
          break;

        default:
          cb = () => {};
          break;
      }
      return playerDetail.filter(cb);
    });
    return (
      <div className="aggregate-tool">
        <div className="name-select-div" style={{ padding: '10px 0' }}>
          <DatePicker
            hintText="Start Date"
            disabled={isLoading}
            value={startDate}
            onChange={(...args) => this.updateDate('start', ...args)}
          />
          <DatePicker
            hintText="End Date"
            disabled={isLoading}
            value={endDate}
            onChange={(...args) => this.updateDate('end', ...args)}
          />
        </div>
        <RaisedButton
          label="Add Grouping Criteria"
          onClick={() => this.setState({ isModalOpen: true })}
        />
        {!groups.length && <AggregateQueryToolGroup group={playerDetail} />}
        {
          aggregateGroups.map((players, i) => (
            <AggregateQueryToolGroup
              group={players}
              key={i}
              deletable
              onDelete={() => this.deleteGroup(i)}
              title={this.formatTitle(i)}
            />
          ))
        }
        {isModalOpen && <EditAggregateGroupModal
          onClose={() => this.setState({ isModalOpen: false })}
          onSave={this.addGroupingCriteria}
        />}
        {isLoading && <div className="overlay transparent">
          <CircularProgress
            color="#555"
            size={30}
            style={{
              margin: '0',
              position: 'absolute',
              transform: 'translate(-50%)',
              top: '50%',
              left: '50%',
            }}
          />
        </div>}
      </div>
    );
  }
}

class AggregateQueryToolGroup extends React.PureComponent {
  state = {
    orderBy: [
      { key: 'rating', order: 'desc' },
      { key: 'endRating', order: 'desc' },
      { key: 'totalRatingChange', order: 'desc' },
      { key: 'totalGameWon', order: 'desc' },
      { key: 'totalMatchWon', order: 'desc' },
    ],
  }

  changeOrderBy = (key) => {
    // toggle order and move to front
    const { orderBy } = this.state;
    const optionIdx = orderBy.findIndex(o => o.key === key);
    const option = orderBy[optionIdx];
    this.setState({
      orderBy: [
        {
          ...option,
          order: option.order === 'desc' ? 'asc' : 'desc',
        },
        ...orderBy.slice(0, optionIdx),
        ...orderBy.slice(optionIdx + 1),
      ],
    });
  }

  orderByIcon(key) {
    const { orderBy } = this.state;
    const order = orderBy.find(o => o.key === key).order;
    return order === 'desc' ?
      <KeyboardArrowDown
        onClick={() => this.changeOrderBy(key)}
        style={{ cursor: 'pointer', marginLeft: '5px' }}
      /> :
      <KeyboardArrowUp
        onClick={() => this.changeOrderBy(key)}
        style={{ cursor: 'pointer', marginLeft: '5px' }}
      />;
  }

  render() {
    const { orderBy } = this.state;
    const { group = [], deletable, title } = this.props;
    const sorted = group.sort((g1, g2) => {
      for (const { key, order } of orderBy) {
        let diff = 0;
        if (order === 'desc') {
          diff = g2[key] - g1[key];
        } else {
          diff = g1[key] - g2[key];
        }

        if (diff !== 0) {
          return diff;
        }
      }
      return 0;
    });
    return (<div className="aggregate-table-container">
      {title && <h3>
        <span>{title}</span>
        {deletable && <IconButton
          iconClassName="material-icons"
          onClick={this.props.onDelete}
          tooltip="Delete Table"
          touch={Boolean(true)}
        >
          <Close />
        </IconButton>}
      </h3>}

      <Table
        selectable={false}
        multiSelectable={false}
        wrapperStyle={{ minWidth: '650px' }}
      >
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Order</TableHeaderColumn>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>
              Rating
              {this.orderByIcon('rating')}
            </TableHeaderColumn>
            <TableHeaderColumn>
              End Rating
              {this.orderByIcon('endRating')}
            </TableHeaderColumn>
            <TableHeaderColumn>
              Rating Change Total
              {this.orderByIcon('totalRatingChange')}
            </TableHeaderColumn>
            <TableHeaderColumn>
              Game Won
              {this.orderByIcon('totalGameWon')}
            </TableHeaderColumn>
            <TableHeaderColumn>
              Match Won
              {this.orderByIcon('totalMatchWon')}
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {
            sorted.map((player, i) => (
              <TableRow key={i}>
                <TableRowColumn>{i + 1}</TableRowColumn>
                <TableRowColumn>{player.name}</TableRowColumn>
                <TableRowColumn>{player.rating}</TableRowColumn>
                <TableRowColumn>{player.endRating}</TableRowColumn>
                <TableRowColumn className="aggregate-table--rating-change-col">
                  <div className="aggregate-table--rating-change">
                    {player.totalRatingChange}
                    <RatingProgressTooltip history={player.ratingChangeHistory} />
                  </div>
                </TableRowColumn>
                <TableRowColumn>{player.totalGameWon}</TableRowColumn>
                <TableRowColumn>{player.totalMatchWon}</TableRowColumn>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>);
  }
}

class RatingProgressTooltip extends React.PureComponent {
  render() {
    const { history } = this.props;
    const icons = {
      swapVert: <SwapVert style={{ marginRight: '5px' }} />,
      trendingUp: <TrendingUp style={{ marginRight: '5px' }} />,
      trendingFlat: <TrendingFlat style={{ marginRight: '5px' }} />,
      trendingDown: <TrendingDown style={{ marginRight: '5px' }} />,
    };
    return (
      <ul className="aggregate-table--tooltip">
        {
          history.map(r => (
            <li>
              <span style={{ marginRight: '10px', fontWeight: 500 }}>{r.date}</span>
              {icons[r.type]}
              <span style={{ marginRight: '5px' }}>{r.description}</span>
              {r.change}
            </li>
          ))
        }
      </ul>
    );
  }
}

class EditAggregateGroupModal extends React.PureComponent {
  state = {
    choice: 'between',
    firstInput: '',
    secondInput: '',
    errors: {},
  }

  updateChoice = (ev, choice) => {
    this.setState({ choice });
    if (choice !== 'between') {
      this.setState({ secondInput: '' });
    } else {
      this.setState({ secondInput: this.state.firstInput });
    }
  }

  updateInput = (idx, ev) => {
    if (idx === 1) {
      this.setState({ firstInput: ev.target.value });
    } else {
      this.setState({ secondInput: ev.target.value });
    }
  }

  handleSave = () => {
    if (this.validate()) {
      const { firstInput, secondInput } = this.state;
      this.props.onSave(this.state.choice, [+firstInput, +secondInput]);
      this.props.onClose();
    }
  }

  validate() {
    const { firstInput, secondInput, errors, choice } = this.state;
    let isValid = true;
    if (+firstInput < 0 || +firstInput >= 3000) {
      isValid = false;
      this.setState({
        errors: {
          ...errors,
          firstinput: 'Rating must be between 0 and 3000',
        },
      });
    } else if (+secondInput < 0 || +secondInput >= 3000) {
      isValid = false;
      this.setState({
        errors: {
          ...errors,
          secondInput: 'Rating must be between 0 and 3000',
        },
      });
    } else if (choice === 'between') {
      if (+secondInput < +firstInput) {
        isValid = false;
        this.setState({
          errors: {
            ...errors,
            secondInput: 'Second value must be greater than first value',
          },
        });
      }
    }

    return isValid;
  }

  render() {
    const { choice, firstInput, secondInput, errors } = this.state;
    const labelRef = {
      between: 'Between',
      greater: 'Greater Than',
      less: 'Less Than',
    };
    return (
      <div className="edit-aggregate-group-modal">
        <IconButton
          style={{ position: 'absolute', right: '10px', top: '10px' }}
          iconClassName="material-icons"
          onClick={this.props.onClose}
          tooltip="Close Modal"
          touch={Boolean(true)}
        >
          <Close />
        </IconButton>
        <h3>Add/Modify Group</h3>
        <RadioButtonGroup name="shipSpeed" valueSelected={choice} onChange={this.updateChoice} style={{ margin: '0 20px' }}>
          <RadioButton
            value="between"
            label="Rating Between"
          />
          <RadioButton
            value="greater"
            label="Rating Greater Than"
          />
          <RadioButton
            value="less"
            label="Rating Less Than"
          />
        </RadioButtonGroup>
        <div className="edit-aggregate-group-modal--inputs">
          <span>{labelRef[choice]}</span>
          <TextField
            type="text"
            style={{ width: '45px', margin: '0 10px' }}
            value={firstInput}
            onChange={e => this.updateInput(1, e)}
            errorText={errors.firstInput}
            id="first-input"
          />
          {choice === 'between' && <span>And</span>}
          {
            choice === 'between' &&
            <TextField
              type="text"
              style={{ width: '45px', margin: '0 10px' }}
              value={secondInput}
              onChange={e => this.updateInput(2, e)}
              errorText={errors.secondInput}
              id="second-input"
            />
          }
        </div>
        <RaisedButton
          label="Submit"
          onTouchTap={this.handleSave}
          fullWidth={true}
        />
      </div>
    );
  }
}

export default AggregateQueryTool;
