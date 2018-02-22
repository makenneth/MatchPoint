import React from 'react';
import onClickOutside from 'react-onclickoutside-decorator';
import TextField from 'material-ui/TextField';

import './styles.scss';

@onClickOutside
export default class AutoComplete extends React.PureComponent {
  render() {
    const {
      predictions,
      addressFocused,
      className,
      label = 'Address',
      displayKey = 'description',
      style = {},
      floatingLabelFocusStyle = {},
      customInput,
      customListItem,
      isLoading,
    } = this.props;

    return (
      <div className={`address-container ${className}`}>
        {customInput}
        {!customInput && <TextField
          onFocus={this.props.onFocus}
          value={this.props.value}
          style={style}
          onChange={this.props.onChange}
          errorText={this.props.errorText}
          floatingLabelText={label}
          type="text"
          fullWidth={Boolean(true)}
          floatingLabelFocusStyle={floatingLabelFocusStyle}
        />}
        <ul
          className={`suggestions ${predictions.length > 0 && addressFocused ? ' open' : ''}`}
        >
          {
            predictions.map((p, i) => (
              <li key={i} onClick={() => this.props.selectPrediction(p)}>
                {customListItem && customListItem(p)}
                {!customListItem && p[displayKey]}
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}
