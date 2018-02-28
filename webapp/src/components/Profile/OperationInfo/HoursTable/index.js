import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimePicker from 'material-ui/TimePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Plus from 'react-icons/lib/fa/plus';
import MdSchedule from 'react-icons/lib/md/schedule';
// import Check from 'react-icons/lib/md/check';
import Clear from 'react-icons/lib/md/clear';
import Delete from 'react-icons/lib/md/delete';
import Edit from 'react-icons/lib/md/edit';
import Save from 'react-icons/lib/md/save';
import './styles.scss';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class HoursTable extends React.PureComponent {
  static propTypes = {
    updateClubHour: PropTypes.func,
    addClubHour: PropTypes.func,
    deleteClubHour: PropTypes.func,
    hours: PropTypes.array,
    hourState: PropTypes.object,
    type: PropTypes.string,
    readOnly: PropTypes.bool,
  };

  state = {
    newRow: null,
    editingRow: null,
  };

  componentWillReceiveProps(nextProps) {
    const { isLoading, type, hourType } = this.props.hourState;
    if (!this.props.readOnly) {
      if (hourType === this.props.type && isLoading &&
        !nextProps.hourState.isLoading && !nextProps.hourState.error) {
        if (type === 'ADD') {
          this.setState({ newRow: null });
        } else if (type === 'UPDATE') {
          this.setState({ editingRow: null });
        }
      }
    }
  }

  addRow = () => {
    if (!this.props.readOnly) {
      this.setState({
        newRow: {
          day: 0,
          open: new Date(),
          close: new Date(),
        },
      });
    }
  }

  cancelAddRow = () => {
    this.setState({ newRow: null });
  }

  beginUpdatePeriod = (i, j) => {
    if (!this.props.readOnly) {
      const period = this.props.hours[i][j];
      this.setState({
        editingRow: {
          ...period,
          open: new Date(period.open),
          close: new Date(period.close),
        },
      });
    }
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

  updateTime = (type, time) => {
    this.setState({
      editingRow: {
        ...this.state.editingRow,
        [type]: time,
      },
    });
  }

  handleSubmitNewRow = () => {
    if (!this.props.readOnly) {
      this.props.addClubHour(this.props.type, this.state.newRow);
    }
  }

  handleUpdateClubHour = () => {
    if (!this.props.readOnly) {
      const updated = this.state.editingRow;
      this.props.updateClubHour(updated.id, updated);
    }
  }

  renderSessionTime(session, dayIdx, periodIdx, editingData, isNew) {
    const callback = isNew ? this.updateNewTime : this.updateTime;
    const textFieldStyle = { width: '80px', height: '36px', marginRight: '20px  ' };
    if (isNew) {
      textFieldStyle.width = '80px';
      textFieldStyle.height = '48px';
    }

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
      </div>);
    }

    return (<div className="hours-table-container--hour-row normal" key={periodIdx}>
      <span>{moment(session.open).format('h:mm A')}</span>
      <span>-</span>
      <span>{moment(session.close).format('h:mm A')}</span>
      {!this.props.readOnly && <span className="buttons">
        <Edit
          style={{ cursor: 'pointer' }}
          onClick={() => this.beginUpdatePeriod(dayIdx, periodIdx)}
        />
      </span>}
    </div>);
  }

  renderHoursRow(hours, dayIdx, periodIdx) {
    const editingData = this.state.editingRow &&
      this.state.editingRow.id === hours.id ? this.state.editingRow : null;
    return [
      this.renderSessionTime(hours, dayIdx, periodIdx, editingData),
      editingData && <span className="buttons">
        <Delete
          style={{ color: '#EF5350', cursor: 'pointer' }}
          onClick={() => this.props.deleteClubHour(hours)}
        />
        <Save
          style={{ color: '#66BB6A', cursor: 'pointer' }}
          onClick={() => this.handleUpdateClubHour(hours.id)}
        />
      </span>,
    ];
  }

  renderDayRow(day, dayIdx) {
    return (<div className="hours-table-container--row" key={`row${dayIdx}`}>
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
    const { readOnly } = this.props;
    return (
      <div className="hours-table-container">
        <h2 className="contact-info-container--title">
          <MdSchedule />
          {this.props.title}
        </h2>
        <div className="hours-table-container--header hours-table-container--row">
          <div>Day</div>
          <div>Hours</div>
          <span className="plus-button">
            {!readOnly && !newRow && <Plus onClick={this.addRow} />}
          </span>
        </div>
        <div className="hours-table-container--body">
          {this.props.hours.map((day, i) => this.renderDayRow(day, i))}
        </div>
        {
          !readOnly && newRow && <div className="hours-table-container--new-row">
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
