import React, { Component } from 'react';
import { connect } from 'react-redux';
import { openEditModal, openNewModal, closeNewModal, closeEditModal } from 'redux/modules/modals';
import { fetchCurrentPlayers, addPlayer, updatePlayer } from 'redux/modules/players';
import { PlayerForm, Tutorial } from 'components';
import UploadDialog from './UploadDialog';
import TabContainer from './TabContainer';

@connect(({ newSession, modals }) => ({ session: newSession, modals }),
  {
    openNewModal,
    openEditModal,
    closeNewModal,
    closeEditModal,
    fetchCurrentPlayers,
    addPlayer,
    updatePlayer,
  })
export default class NewRRSession extends Component {
  state = {
    tutorialOpen: localStorage.getItem('tutorial') === null ?
      true : localStorage.getItem('tutorial'),
  };

  componentWillMount() {
    if (!this.props.session.loaded && !this.props.session.loading) {
      this.props.fetchCurrentPlayers();
    }
  }
  render() {
    const elements = [
      {
        selector: '.registration-tab',
        text: 'This is where you would add players to the roster',
        callback: () => {},
      },
      {
        selector: '.grouping-tab',
        text: 'This would be where you group players',
        callback: () => {},
      },
      {
        selector: '.session-date-picker',
        text: 'You can select the date of the session here',
      },
      {
        selector: '.new-player-button',
        text: 'You can add new player',
      },
      {
        selector: '.upload-player-button',
        text: 'You can mass upload player.',
      },
      {
        selector: '.table-search-field',
        text: 'You can search for player here.',
      },
    ];
    const { newPlayerModal, editPlayerModal } = this.props.modals;
    return (<div className="tab-container">
      <TabContainer />
      <UploadDialog />
      {
        newPlayerModal &&
          (<div className="overlay">
            <PlayerForm
              title="Register Player"
              callback={this.props.addPlayer}
              modalOpen={newPlayerModal}
              closeModal={this.props.closeNewModal}
            />
          </div>)
      }
      {
        editPlayerModal.open &&
          (<div className="overlay">
            <PlayerForm
              title="Update Player"
              callback={this.props.updatePlayer}
              player={editPlayerModal.player}
              modalOpen={editPlayerModal.open}
              closeModal={this.props.closeEditModal}
            />
          </div>)
      }
      {
        this.state.tutorialOpen &&
          <Tutorial
            elements={elements}
            closeTutorial={() => this.setState({ tutorialOpen: false })}
          />
        }
    </div>);
  }
}
