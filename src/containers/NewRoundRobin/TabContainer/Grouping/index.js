import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import { NumOfPlayers, ParticipantGroup } from 'components';
import { changeSchema, movePlayerUp, movePlayerDown } from 'redux/modules/schemata';
import { stopLoad } from 'redux/modules/main';
import { preSetTab } from 'redux/modules/navbar';
import PDFGenerator from 'utils/PDFGenerator';
import { setMinAndMax, temporarySave, saveSession } from 'redux/modules/newSession';
import moment from 'moment';

@connect(
  ({ auth: { club }, newSession, schemata }) => ({ club, ...newSession, ...schemata }),
  {
    changeSchema,
    setMinAndMax,
    stopLoad,
    saveSession,
    temporarySave,
    movePlayerUp,
    movePlayerDown,
    preSetTab,
  }
)
export default class Grouping extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      title: null,
      message: null,
    };
  }

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  }

  schemata() {
    const { schemata, selected } = this.props;
    const floatingStyle = {
      zIndex: selected.length ? 'auto' : 999,
      color: selected.length ? '#E0E0E0' : 'orange',
    };

    if (schemata.length) {
      return (<div>
        <SelectField
          value={selected.join(',')}
          onChange={this.changeSchema}
          floatingLabelStyle={floatingStyle}
          floatingLabelText="Select a schema"
          floatingLabelFixed={Boolean(true)}
          style={{ zIndex: selected.length ? 'auto' : 999 }}
          errorText={selected.length ? '' : 'Select an arrangement'}
          errorStyle={{ color: 'orange' }}
        >
          {
            schemata ?
              schemata.map(schema => (
                <MenuItem
                  key={schema}
                  value={schema.join(',')}
                  primaryText={schema.join(', ')}
                />
              ))
              :
              <MenuItem key={'noth'} disabled={Boolean(true)} primaryText="No Available Schemas..." />
          }
        </SelectField>
      </div>);
    }
    return null;
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
      this.props.club.clubName,
      this.props.sortedPlayers,
      this.props.selected,
      this.props.numJoined,
      moment(this.props.date).format('YYYY-MM-DD')).generate();
  }

  handleSave = () => {
    if (this.props.selected.length === 0) {
      this.setState({
        title: 'Well....',
        message: 'You have to have selected a schema before you can save.',
        dialogOpen: true,
      });
    } else {
      this.props.saveSession({
        date: moment(this.props.date).format('YYYY-MM-DD'),
        numOfPlayers: this.props.numJoined,
        schemata: this.props.schemata,
        selectedSchema: this.props.selected,
        players: this.props.sortedPlayers,
      }).then(() => {
        this.props.preSetTab('/club/sessions');
        browserHistory.push('/club/sessions');
      });
    }
  }

  promote = (groupId, playerRank) => {
    const success = this.props.addedPlayers.toPlayerList().promote(groupId, playerRank);
    if (success) {
      this.forceUpdate();
    }
  }

  demote = (groupId, playerRank) => {
    const success = this.props.addedPlayers.toPlayerList().demote(groupId, playerRank);
    if (success) {
      this.forceUpdate();
    }
  }

  groupTables() {
    const playerList = this.props.addedPlayers.toPlayerList(this.props.selected).toArray();

    return (<div>
      {
        this.props.selected.map((numPlayers, i, arr) => {
          return (<ParticipantGroup
            key={`${i}${numPlayers}`} groupId={i}
            numPlayers={numPlayers}
            players={playerList[i]}
            promote={i === 0 ? null : this.promote}
            demote={i === arr.length - 1 ? null : this.demote}
            moveUp={i === 0 ? null : this.props.movePlayerUp}
            moveDown={i === arr.length - 1 ? null : this.props.movePlayerDown}
          />);
        })
      }
    </div>);
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
  render() {
    let schemata;
    let groupTables;

    if (this.props.max && this.props.min) {
      schemata = this.schemata();
      if (this.props.selected.length) {
        groupTables = this.groupTables();
      }
    }

    return (<div className="grouping">
      <IconMenu
        style={{
          position: 'absolute',
          right: 0,
          top: '-20px',
          zIndex: '50',
        }}
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem
          primaryText="Generate PDF"
          onClick={this.generatePDF}
          disabled={!this.props.selected.length}
        />
        <MenuItem
          primaryText="Save"
          onClick={this.handleSave}
          disabled={!this.props.selected.length}
        />
      </IconMenu>
      <NumOfPlayers
        setMinAndMax={this.props.setMinAndMax}
        min={this.props.min}
        max={this.props.max}
      />

      {schemata}
      {groupTables}
      {this.state.dialog && this.dialog()}
    </div>);
  }
}
