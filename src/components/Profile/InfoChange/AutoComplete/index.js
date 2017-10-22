import React from 'react';
import onClickOutside from 'react-onclickoutside-decorator';
import TextField from 'material-ui/TextField';

@onClickOutside
export default class AutoComplete extends React.PureComponent {
  render() {
    const { predictions, addressFocused } = this.props;
    return (
      <div className="address-container">
        <TextField
          onFocus={this.props.onFocus}
          value={this.props.value}
          onChange={this.props.onChange}
          errorText={this.props.errorText}
          floatingLabelText="Address"
          type="text"
          fullWidth={Boolean(true)}
        />
        <ul
          className={`suggestions ${predictions.length > 0 && addressFocused ? ' open' : ''}`}
        >
          {
            predictions.map((p, i) => (
              <li key={i} onClick={() => this.props.selectPrediction(p)}>
                {p.description}
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}
