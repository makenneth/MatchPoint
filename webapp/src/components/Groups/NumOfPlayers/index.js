import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const rangeOfPlayers = [3, 4, 5, 6, 7];
export default class NumOfPlayers extends React.PureComponent {
  handleChange = (field, e, idx, value) => {
    if (value) {
      const { min, max } = this.props;
      if (field === 'min') {
        this.props.setMinAndMax(value, max);
      } else if (field === 'max') {
        this.props.setMinAndMax(min, value);
      }
    }
  }
  render() {
    const { min, max } = this.props;
    const minFloatingStyle = {
      zIndex: max && !min ? 999 : 'auto',
      color: max && !min ? 'orange' : '#E0E0E0',
    };

    const maxFloatingStyle = {
      zIndex: max ? 'auto' : 999,
      color: max ? '#E0E0E0' : 'orange',
    };

    return (<div className="min-max">
      <SelectField
        value={max}
        style={{ zIndex: !max ? 999 : 'auto' }}
        floatingLabelStyle={maxFloatingStyle}
        errorText={!max ? 'Maximum number of players you want to allow' : ''}
        errorStyle={{ color: 'orange' }}
        floatingLabelFixed={Boolean(true)}
        floatingLabelText="Max Players"
        onChange={(e, idx, val) => this.handleChange('max', e, idx, val)}
      >
        {
          rangeOfPlayers.map(num => (
            <MenuItem key={num} value={num} primaryText={num} disabled={num < min} />
          ))
        }
      </SelectField>
      <SelectField
        value={min}
        style={{ zIndex: max && !min ? 999 : 'auto' }}
        floatingLabelStyle={minFloatingStyle}
        errorStyle={{ color: 'orange' }}
        errorText={max && !min ? 'Minimum number of players you want to allow' : ''}
        floatingLabelFixed={Boolean(true)}
        floatingLabelText="Min Players"
        onChange={(e, idx, val) => this.handleChange('min', e, idx, val)}
      >
        {
          rangeOfPlayers.map(num => (
            <MenuItem key={num} value={num} primaryText={num} disabled={num > max} />
          ))
        }
      </SelectField>
    </div>);
  }
}
