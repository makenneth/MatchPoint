import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import TimePicker from 'material-ui/TimePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Plus from 'react-icons/lib/fa/plus';
// import Check from 'react-icons/lib/md/check';
import Clear from 'react-icons/lib/md/clear';
import Delete from 'react-icons/lib/md/delete';
import Edit from 'react-icons/lib/md/edit';
import Save from 'react-icons/lib/md/save';
import './styles.scss';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class HoursTable extends Component {
  static propTypes = {
    updateClubHour: PropTypes.func,
    addClubHour: PropTypes.func,
    deleteClubHour: PropTypes.func,
    hours: PropTypes.array,
    hourState: PropTypes.object,
    type: PropTypes.string,
  };

  state = {
    newRow: null,
    editingRows: {},
  };

  componentWillReceiveProps(nextProps) {
    const { isLoading, type, hourType } = this.props.hourState;
    if (isLoading && !nextProps.hourState.isLoading && !nextProps.hourState.error) {
      if (type === 'ADD' && hourType === this.props.type) {
        this.setState({ newRow: null });
      }
    }
  }

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

  beginUpdatePeriod = (i, j) => {
    debugger;
    const period = this.props.hours[i][j];
    this.setState({
      editingRows: {
        ...this.state.editingRows,
        [period.id]: {
          ...period,
          open: moment(period.open),
          close: moment(period.close),
        },
      },
    });
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

  updateTime = (id, type, time) => {
    const { [id]: row } = this.state.editingRows;
    this.setState({
      editingRows: {
        ...this.state.editingRows,
        [id]: {
          ...row,
          [type]: time,
        },
      },
    });
  }

  handleSubmitNewRow = () => {
    this.props.addClubHour(this.props.type, this.state.newRow);
  }

  handleUpdateClubHour = (id) => {
    const { [id]: updated } = this.state.editingRows;
    this.props.updateClubHour(id, updated);
  }

  renderSessionTime(session, dayIdx, periodIdx, editingData, isNew) {
    const callback = isNew ? this.updateNewTime : this.updateTime.bind(this, dayIdx, periodIdx);
    const textFieldStyle = { width: '100px', height: '30px' };
    if (isNew) {
      textFieldStyle.width = '80px';
      textFieldStyle.height = '48px';
    }
    console.log(session, editingData);
    if (editingData) {
      return (<div className="hours-table-container--hour-row" key={periodIdx}>
        <div>
          <span className="hours-table-container--hour-label">Open:</span>
          <TimePicker
            name="start-time"
            minutesStep={15}
            value={editingData.open}
            onChange={(ev, date) => callback('open', date)}
            textFieldStyle={textFieldStyle}
          />
        </div>
        <div>
          <span className="hours-table-container--hour-label">Close:</span>
          <TimePicker
            name="close-time"
            minutesStep={15}
            value={editingData.close}
            onChange={(ev, date) => callback('close', date)}
            textFieldStyle={textFieldStyle}
          />
        </div>
        <span className="buttons">
          <Delete
            style={{ color: '#EF5350', cursor: 'pointer' }}
            onClick={() => this.props.deleteClubHour(session)}
          />
          <Save
            style={{ color: '#66BB6A', cursor: 'pointer' }}
            onClick={() => this.handleUpdateClubHour(session.id)}
          />
        </span>
      </div>);
    }

    return (<div className="hours-table-container--hour-row normal" key={periodIdx}>
      <span>{moment(session.open).format('h:mm A')}</span>
      <span>-</span>
      <span>{moment(session.close).format('h:mm A')}</span>
      <span className="buttons">
        <Edit
          style={{ cursor: 'pointer' }}
          onClick={() => this.beginUpdatePeriod(dayIdx, periodIdx)}
        />
      </span>
    </div>);
  }

  renderHoursRow(hours, dayIdx, periodIdx) {
    const { editingRows } = this.state;
    // probably need to add dst offset or something.
    return this.renderSessionTime(hours, dayIdx, periodIdx, editingRows[hours.id]);
  }

  renderDayRow(day, dayIdx) {
    return (<div className="hours-table-container--row">
      <div className="hours-table-container--label">{dayNames[dayIdx]}</div>
      {
        <div className="hours-table-container--hours-rows" key={dayIdx}>
          {day.map((hours, periodIdx) => this.renderHoursRow(hours, dayIdx, periodIdx))}
          {day.length === 0 && <span className="not-open-placeholder">Not Open</span>}
        </div>
      }
    </div>);
  }

  render() {
    const { newRow } = this.state;
    console.log('state', this.state.editingRows);
    console.log(newRow);
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
                <Save
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
