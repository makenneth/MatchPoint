import React from 'react';
import moment from 'moment';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AppBar from 'material-ui/AppBar';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

class MenuBar extends React.PureComponent {
  render() {
    const { date, isLoading, editable, finalized } = this.props;

    const iconMenu = (<IconMenu
      iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
    >
      <MenuItem primaryText="Save" onClick={this.props.saveSession} />
      {
        date && !finalized &&
          <MenuItem primaryText="Edit Detail" onClick={this.props.handleEdit} />
      }
      <MenuItem primaryText="Delete" onClick={this.props.handleDelete} />
    </IconMenu>);
    return (<AppBar
      className="app-bar"
      title={`Date: ${moment(date).format('MMMM DD, YYYY')}`}
      iconElementLeft={
        !isLoading ? (<IconButton
          onClick={this.props.handleBack}
          className="closeIcon"
        >
          <NavigationClose />
        </IconButton>) : null
      }
      iconElementRight={editable && !isLoading ? iconMenu : null}
    />);
  }
}

export default MenuBar;
