import React, { Component } from 'react';
import { connect } from 'react-redux';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import Toggle from 'material-ui/Toggle';
import { /* NumOfPlayers, */ ParticipantGroup } from 'components';
import { changeSchema, movePlayerUp, movePlayerDown } from 'redux/modules/schemata';
import { stopLoad } from 'redux/modules/main';
import PDFGenerator from 'utils/PDFGenerator';
import { setMinAndMax, temporarySave, createSession } from 'redux/modules/newSession';
import { updateSessionDetail } from 'redux/modules/sessions';
import moment from 'moment';

@connect(
  ({ auth: { club }, newSession, schemata }) => ({ club, ...newSession, ...schemata }),
  {
    changeSchema,
    setMinAndMax,
    stopLoad,
    createSession,
    updateSessionDetail,
    temporarySave,
    movePlayerUp,
    movePlayerDown,
  }
)
export default class Grouping extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      title: null,
      message: null,
      isPromotionEnabled: true,
    };
  }

  togglePromotionEnabled = () => {
    this.setState({ isPromotionEnabled: !this.state.isPromotionEnabled });
  }

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  }

  changeSchema = (e, _, selectedGroup) => {
    if (selectedGroup) {
      this.totalPlayerAdded = 0;
      this.props.changeSchema(selectedGroup.split(',').map(el => +el));
    }
  }

  generatePDF = () => {
    if (this.props.schemata[0].length === 0) {
      this.setState({
        title: 'Ooooops..',
        message: 'There are no players yet :(.',
        dialogOpen: true,
      });
      return;
    }
    new PDFGenerator(
      this.props.club.club_name,
      this.props.addedPlayers.toPlayerList(),
      this.props.selected,
      this.props.addedPlayers.length(),
      moment(this.props.date).format('YYYY-MM-DD'),
    ).generate();
  }

  handleSwap = (g1, idx1, swapeeId) => {
    this.props.addedPlayers.playerList.swap(g1, idx1, swapeeId);
    this.forceUpdate();
  }

  handleSave = () => {
    if (this.props.selected.length === 0) {
      this.setState({
        title: 'Well....',
        message: 'You have to have selected a schema before you can save.',
        dialogOpen: true,
      });
    } else {
      if (this.props.editingId) {
        this.props.updateSessionDetail(
          this.props.editingId,
          {
            date: moment(this.props.date).format('YYYY-MM-DD'),
            numOfPlayers: this.props.addedPlayers.length(),
            selectedSchema: this.props.selected,
            players: this.props.addedPlayers.toPlayerList().flatten(),
          }
        );
      } else {
        this.props.createSession({
          date: moment(this.props.date).format('YYYY-MM-DD'),
          numOfPlayers: this.props.addedPlayers.length(),
          selectedSchema: this.props.selected,
          players: this.props.addedPlayers.toPlayerList().flatten(),
        });
      }
    }
  }

  dialog() {
    const actions = [
      <FlatButton
        label="Close"
        primary={Boolean(true)}
        onTouchTap={this.handleDialogClose}
      />,
    ];
    return (<Dialog
      title={this.title}
      actions={actions}
      open={this.state.dialogOpen}
      modal={false}
      onRequestClose={this.handleDialogClose}
    >
      {this.content}
    </Dialog>);
  }

  renderGroupTables() {
    if (!this.props.selected.length) {
      return null;
    }
    const playerList = this.props.addedPlayers
      .toPlayerList(this.props.selected, this.props.promoted, this.state.isPromotionEnabled)
      .toArray();
    return (<div>
      {
        this.props.selected.map((numPlayers, i, arr) => {
          return (<ParticipantGroup
            key={`${i}${numPlayers}`} groupId={i}
            numPlayers={numPlayers}
            players={playerList[i]}
            playerList={playerList}
            swapPlayers={this.handleSwap}
            promotedPlayers={this.props.promoted}
            moveUp={i === 0 ? null : this.props.movePlayerUp}
            moveDown={i === arr.length - 1 ? null : this.props.movePlayerDown}
          />);
        })
      }
    </div>);
  }

  renderSchemata() {
    const { schemata, selected } = this.props;
    if (!Array.isArray(schemata[0]) || (schemata && schemata.length > 0)) {
      let errorText = selected.length > 0 ? '' : 'Select an arrangement';
      let errorColor = selected.length > 0 ? 'black' : 'orange';
      const floatingStyle = {
        zIndex: selected.length ? 'auto' : 999,
        color: selected.length ? '#E0E0E0' : 'orange',
      };
      if (Array.isArray(schemata[0]) && schemata[0].length === 0) {
        errorText = 'Please select more players';
        errorColor = 'red';
        floatingStyle.color = 'red';
      }

      return (<SelectField
        id="select-schema-field"
        value={selected.join(',')}
        onChange={this.changeSchema}
        floatingLabelStyle={floatingStyle}
        floatingLabelText="Select a schema"
        floatingLabelFixed={Boolean(true)}
        style={{ zIndex: selected.length ? 'auto' : 999 }}
        labelStyle={{ color: errorColor }}
        errorText={errorText}
        errorStyle={{ color: errorColor }}
      >
        {
          schemata[0].length > 0 ?
            schemata.map(schema => (
              <MenuItem
                key={schema}
                value={schema.join(',')}
                primaryText={schema.join(', ')}
              />
            ))
            :
            <MenuItem
              key="noth"
              value=""
              disabled={Boolean(true)}
              primaryText="No arrangement available"
            />
        }
      </SelectField>);
    }

    return null;
  }

  render() {
    const { isPromotionEnabled } = this.state;
    const disableChange = !this.props.selected.length;
    return (<div className="grouping">
      {!this.props.loading && <IconMenu
        className="group-menu"
        style={{
          position: 'absolute',
          right: 0,
          top: '-20px',
          zIndex: '50',
        }}
        iconButtonElement={<IconButton className="group-menu-icon"><MoreVertIcon /></IconButton>}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem
          primaryText="Generate PDF"
          onClick={this.generatePDF}
          disabled={disableChange}
        />
        <MenuItem
          primaryText="Save"
          onClick={this.handleSave}
          disabled={disableChange}
        />
      </IconMenu>}
      {this.renderSchemata()}
      {!disableChange && <div className="toggle-promotion-container">
        <Toggle
          style={{ width: '200px' }}
          label={`Promotion ${isPromotionEnabled ? 'Enabled' : 'Disabled'}`}
          onToggle={this.togglePromotionEnabled}
          toggled={isPromotionEnabled}
        />
      </div>}
      {this.renderGroupTables()}
      {this.state.dialog && this.dialog()}
    </div>);
  }
}
