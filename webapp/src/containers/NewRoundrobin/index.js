import React from 'react';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import { openEditModal, openNewModal, closeNewModal, closeEditModal } from 'redux/modules/modals';
import {
  fetchCurrentPlayers,
  fetchPromotedPlayers,
} from 'redux/modules/players';
// import { fetchActivePlayers } from 'redux/modules/activePlayers';
import { createPlayer, updatePlayer } from 'redux/modules/websocketActions';
// import { initializeSession } from 'redux/modules/newSession';
import { PlayerForm } from 'components';
import startWebsocket from 'redux/socketMiddleware';
import UploadDialog from './UploadDialog';
import TabContainer from './TabContainer';

@connect(
  ({ players, newSession, modals, websocketConnection }) =>
    ({ session: newSession, modals, players, websocketConnection }),
  {
    openNewModal,
    openEditModal,
    closeNewModal,
    closeEditModal,
    fetchCurrentPlayers,
    fetchPromotedPlayers,
    fetchActivePlayers,
    addPlayer,
    createPlayer,
    updatePlayer,
  }
)
export default class NewRRSession extends React.PureComponent {
  componentWillMount() {
    startWebsocket();
    // if (!this.props.session.loaded && !this.props.session.loading) {
      // this.props.fetchCurrentPlayers();
      // this.props.fetchPromotedPlayers();
      // this.props.fetchActivePlayers();
    // }
  }

  render() {
    // add a new session loader with progress 1/4 things loaded. or something
    // add club splash page
    const { newPlayerModal, editPlayerModal } = this.props.modals;
    const { players, editingId, websocketConnection } = this.props;
    const { progress } = websocketConnection;

    return (<div className="tab-container">
      <TabContainer editingId={editingId} loaded={progress === 100} />
      <UploadDialog />
      {
        newPlayerModal &&
          (<div className="overlay">
            <PlayerForm
              title="Register Player"
              isLoading={players.loading}
              error={players.error}
              callback={this.props.createPlayer}
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
      {
        progress !== 100 && <div className="overlay">
          <div className="session-initialization">
            <div>Session Initializing...</div>
            <CircularProgress
              mode="determinate"
              value={progress}
            />
          </div>
        </div>
      }
    </div>);
  }
}
