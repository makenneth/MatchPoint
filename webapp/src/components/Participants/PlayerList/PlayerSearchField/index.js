import React from 'react';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import Close from 'react-icons/lib/md/close';

const PlayerSearchField = (props) => {
  const buttonStyle = {
    top: '10px',
    color: '#616161',
    fonSize: '18px',
  };

  return (<div className="table-search-field">
    <TextField
      hintText="Start typing..."
      onChange={props.handleUpdateInput}
      value={props.input}
      floatingLabelText="Search for a player"
      fullWidth={Boolean(true)}
    />
    <IconButton
      iconStyle={buttonStyle}
      onClick={props.clearInput}
      iconClassName="material-icons"
      tooltip="Clear Field"
    >
      <Close />
    </IconButton>
  </div>);
};


export default PlayerSearchField;
