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
  static propTypes = {
    updateClubHour: PropTypes.func,
    addClubHour: PropTypes.func,
    deleteClubHour: PropTypes.func,
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
        open: moment(),
        close: moment(),
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

  handleSubmitNewRow = () => {
    this.props.addClubHour(this.props.type, this.state.newRow);
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
          <span className="hours-table-container--hour-label">Open:</span>
          {editingData ?
            <TimePicker
              name="start-time"
              minutesStep={15}
              value={editingData.open}
              onChange={(ev, date) => callback('open', date)}
              textFieldStyle={textFieldStyle}
            /> :
            <span>{moment(session.open).format('h:mm A')}</span>
          }
        </div>
        <div>
          <span className="hours-table-container--hour-label">Close:</span>
          {editingData ?
            <TimePicker
              name="close-time"
              minutesStep={15}
              value={editingData.close}
              onChange={(ev, date) => callback('close', date)}
              textFieldStyle={textFieldStyle}
            /> :
            <span>{moment(session.close).format('h:mm A')}</span>
          }
        </div>
      </div>);
    }

    return (<div className="hours-table-container--hour-row" key={j}>
      <span>{moment(session.open).format('h:mm A')}</span>
      <span>-</span>
      <span>{moment(session.close).format('h:mm A')}</span>
    </div>);
  }

  renderHoursRow(hours, i, j) {
    const { editingRows } = this.state;
    debugger;
    // probably need to add dst offset or something.
    return this.renderSessionTime(hours, i, j, undefined)
  }

  renderDayRow(day, i) {
    return (<div className="hours-table-container--row">
      <div className="hours-table-container--label">{dayNames[i]}</div>
      {
        <div className="hours-table-container--hours-rows" key={i}>
          {day.map((hours, j) => this.renderHoursRow(hours, i, j))}
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
              name="weekday-selector"
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
                <Check
                  style={{ color: '#66BB6A', cursor: 'pointer' }}
                  onClick={this.handleSubmitNewRow}
                />
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
