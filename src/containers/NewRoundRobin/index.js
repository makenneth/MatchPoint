import React, { Component } from 'react';
import { connect } from 'react-redux';
import { openEditModal, openNewModal, closeNewModal, closeEditModal } from 'redux/modules/modals';
import {
  fetchCurrentPlayers,
  addPlayer,
  updatePlayer,
  fetchPromotedPlayers,
} from 'redux/modules/players';
import { fetchActivePlayers } from 'redux/modules/activePlayers';
import { PlayerForm } from 'components';
import UploadDialog from './UploadDialog';
import TabContainer from './TabContainer';

@connect(
  ({ players, newSession, modals }) => ({ session: newSession, modals, players }),
  {
    openNewModal,
    openEditModal,
    closeNewModal,
    closeEditModal,
    fetchCurrentPlayers,
    fetchPromotedPlayers,
    fetchActivePlayers,
    addPlayer,
    updatePlayer,
  }
)
export default class NewRRSession extends Component {
  componentWillMount() {
    if (!this.props.session.loaded && !this.props.session.loading) {
      this.props.fetchCurrentPlayers();
      this.props.fetchPromotedPlayers();
      // this.props.fetchActivePlayers();
    }
  }

  render() {
    const { newPlayerModal, editPlayerModal } = this.props.modals;
    const { players, editingId } = this.props;
    return (<div className="tab-container">
      <TabContainer editingId={editingId} />
      <UploadDialog />
      {
        newPlayerModal &&
          (<div className="overlay">
            <PlayerForm
              title="Register Player"
              isLoading={players.loading}
              error={players.error}
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
              isLoading={players.loading}
              error={players.error}
              callback={this.props.updatePlayer}
              player={editPlayerModal.player}
              modalOpen={editPlayerModal.open}
              closeModal={this.props.closeEditModal}
            />
          </div>)
      }
    </div>);
  }
}
