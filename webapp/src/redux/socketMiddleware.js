import WSActionTypes from 'redux/wsActionTypes';
import * as Websocket from 'redux/modules/websocketActions';
import * as NewSession from 'redux/modules/newSession';
import * as Players from 'redux/modules/players';
import { closeEditModal, closeNewModal } from 'redux/modules/modals';
import store from './store';

let room;

// const CHANNEL_EVENTS = {
//   close: 'phx_close',
//   error: 'phx_error',
//   join: 'phx_join',
//   reply: 'phx_reply',
//   leave: 'phx_leave',
// };

export default async function startWebsocket() {
  let socket;
  try {
    socket = await store.dispatch(Websocket.connect());
    console.log(socket);
  } catch (e) {
    console.warn(e);
    // probably direct to signup page
    return;
  }
  room = socket.channel('session:abcd', {});

  room.on('INITIAL_STATE', (res) => {
    store.dispatch(NewSession.initializeSessionSuccess(res.data.players, res.data.added_players));
  });

  room.on('PLAYER_UNREGISTERED', res => {
    store.dispatch(NewSession.unregisterPlayer(res.id));
  });

  room.on('PLAYER_REGISTERED', (res) => {
    store.dispatch(NewSession.registerPlayer(res.id));
  });

  room.on('CREATE_PLAYER_SUCCESS', (res) => {
    store.dispatch(closeNewModal());
    store.dispatch(Players.addPlayerSuccess(res.player, res.shouldAdd));
  });

  room.on('CREATE_PLAYER_FAILURE', (res) => {
    store.dispatch(Players.addPlayerFailure(res.error));
  });

  room.on('UPDATE_PLAYER_SUCCESS', (res) => {
    store.dispatch(closeEditModal());
    store.dispatch(Players.updatePlayerSuccess(res.player));
  });

  room.on('UPDATE_PLAYER_FAILURE', (res) => {
    store.dispatch(Players.updatePlayerFailure(res.error));
  });

  room.on('DELETE_PLAYER_SUCCESS', (res) => {
    store.dispatch(Players.deletePlayerSuccess(res.id));
  });

  room.on('DELETE_PLAYER_FAILURE', (res) => {
    store.dispatch(Players.deletePlayerFailure(res.error));
  });

  room.join().receive('ok', () => {
    store.dispatch(Websocket.joinRoomSuccess());
    console.log('Connected!!');
  });
}

export function websocketMiddleware() {
  return next => action => {
    if (!room) return next(action);
    switch (action.type) {
      case WSActionTypes.REGISTER_PLAYER_REQUEST:
        room.push('REGISTER_PLAYER', { id: action.payload.id });
        break;
      case WSActionTypes.UNREGISTER_PLAYER_REQUEST:
        room.push('UNREGISTER_PLAYER', { id: action.payload.id });
        break;
      case WSActionTypes.CREATE_PLAYER_REQUEST:
        room.push('CREATE_PLAYER', {
          player: action.payload.player,
          add_after_success: action.payload.checked
        });
        break;
      case WSActionTypes.UPDATE_PLAYER_REQUEST:
        room.push('UPDATE_PLAYER', { player: action.payload.player });
        break;
      case WSActionTypes.DELETE_PLAYER_REQUEST:
        room.push('DELETE_PLAYER', { id: action.payload.id });
        break;

      default:
        break;
    }

    return next(action);
  };
}
