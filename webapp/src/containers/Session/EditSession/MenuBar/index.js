import React from 'react';
import moment from 'moment';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AppBar from 'material-ui/AppBar';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

const MenuBar = (props) => {
  const { date, isLoading, editable, finalized } = props;

  const iconMenu = (<IconMenu
    iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
  >
    <MenuItem primaryText="Save" onClick={props.saveSession} />
    {
      date && !finalized &&
        <MenuItem primaryText="Edit Detail" onClick={props.handleEdit} />
    }
    <MenuItem primaryText="Delete" onClick={props.handleDelete} />
  </IconMenu>);
  return (<AppBar
    className="app-bar"
    title={`Date: ${moment(date).utc().format('MMMM DD, YYYY')}`}
    iconElementLeft={
      !isLoading ? (<IconButton
        onClick={props.handleBack}
        className="closeIcon"
      >
        <NavigationClose />
      </IconButton>) : null
    }
    iconElementRight={editable && !isLoading ? iconMenu : null}
  />);
};

export default MenuBar;
