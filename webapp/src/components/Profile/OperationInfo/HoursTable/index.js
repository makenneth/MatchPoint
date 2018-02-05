import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import TimePicker from 'material-ui/TimePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Plus from 'react-icons/lib/md/playlist-add';
import Check from 'react-icons/lib/md/check';
import Clear from 'react-icons/lib/md/clear';
import './styles.scss';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class HoursTable extends Component {
  static defaultProps = {
    hours: Array.from(Array(7), () => ([])),
  };

  static propTypes = {
    hours: PropTypes.array,
  };

  state = {
    newRow: null,
    editingRows: {},
  };

  addRow = () => {
    this.setState({
      newRow: {
        day: 0,
        start: moment(),
        end: moment(),
      },
    });
  }

  cancelAddRow = () => {
    this.setState({ newRow: null });
  }

  updateTime = () => {

  }

  updateNewDay = (day) => {
    this.setState({
      newRow: {
        ...this.state.newRow,
        day,
      },
    });
  }

  updateNewTime = (type, time) => {
    this.setState({
      newRow: {
        ...this.state.newRow,
        [type]: time,
      },
    });
  }

  renderSessionTime(session, i, j, editingData, isNew) {
    const callback = isNew ? this.updateNewTime : this.updateTime.bind(this, i, j);
    const textFieldStyle = { width: '100px', height: '30px' };
    if (isNew) {
      textFieldStyle.width = '80px';
      textFieldStyle.height = '48px';
    }

    if (editingData) {
      return (<div className="hours-table-container--hour-row" key={j}>
        <div>
          <span className="hours-table-container--hour-label">Start:</span>
          {editingData ?
            <TimePicker
              minutesStep={15}
              value={editingData.start}
              onClick={(...args) => callback('start', ...args)}
              textFieldStyle={textFieldStyle}
            /> :
            <span>{moment(session.start).format('h:mm A')}</span>
          }
        </div>
        <div>
          <span className="hours-table-container--hour-label">End:</span>
          {editingData ?
            <TimePicker
              minutesStep={15}
              value={editingData.end}
              onClick={(...args) => callback('end', ...args)}
              textFieldStyle={textFieldStyle}
            /> :
            <span>{moment(session.end).format('h:mm A')}</span>
          }
        </div>
      </div>);
    }

    return (<div className="hours-table-container--hour-row" key={j}>
      <span>{session.start}</span>
      <span>-</span>
      <span>{session.end}</span>
    </div>);
  }

  renderHoursRow(hours, i) {
    const { editingRows } = this.state;
    // probably need to add dst offset or something.
    return hours.map((session, j) => (
      this.renderSessionTime(session, i, j, editingRows[i][j])
    ));
  }

  renderDayRow(day, i) {
    return (<div className="hours-table-container--row">
      <div className="hours-table-container--label">{dayNames[i]}</div>
      {
        <div className="hours-table-container--hours-rows" key={i}>
          {day.map(hours => this.renderHoursRow(hours, i))}
          {day.length === 0 && <span className="not-open-placeholder">Not Open</span>}
        </div>
      }
    </div>);
  }

  render() {
    const { newRow } = this.state;
    return (
      <div className="hours-table-container">
        <h2 className="hours-table-container--title">
          {this.props.title}
        </h2>
        <div className="hours-table-container--header hours-table-container--row">
          <div>Day</div>
          <div>Hours</div>
          <span className="plus-button">
            {!newRow && <Plus onClick={this.addRow} />}
          </span>
        </div>
        <div className="hours-table-container--body">
          {this.props.hours.map((day, i) => this.renderDayRow(day, i))}
        </div>
        {
          newRow && <div className="hours-table-container--new-row">
            <SelectField
              onChange={(e, idx, val) => this.updateNewDay(val)}
              style={{ marginRight: '70px', width: '100px' }}
              value={newRow.day}
            >
              {
                dayNames.map((name, i) => (
                  <MenuItem key={i} value={i} primaryText={name} />
                ))
              }
            </SelectField>
            <div className="hours-table-container--new-input">
              {this.renderSessionTime(null, null, null, newRow, true)}
              <div className="hours-table-container--new-button">
                <Check style={{ color: '#66BB6A', cursor: 'pointer' }} />
                <Clear
                  style={{ color: '#EF5350', cursor: 'pointer' }}
                  onClick={this.cancelAddRow}
                />
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}


export default HoursTable;
