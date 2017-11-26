import { Socket } from 'phoenix-socket';
import WSActionTypes from 'redux/wsActionTypes';
import ActionTypes from 'redux/actionTypes';

const initialState = {
  progress: 0,
  isLoading: false,
  error: null,
  socket: null,
};

export default function WebsocketConnection(state = initialState, action) {
  switch (action.type) {
    case WSActionTypes.WEBSOCKET_CONNECT_REQUEST:
      return {
        ...state,
        error: null,
        isLoading: true,
      };

    case WSActionTypes.WEBSOCKET_CONNECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        progress: 33,
        socket: action.payload.socket,
      };

    case WSActionTypes.WEBSOCKET_CONNECT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case ActionTypes.INITIALIZE_SESSION_SUCCESS:
      return {
        ...state,
        progress: 100,
      };

    case WSActionTypes.JOIN_ROOM_SUCCESS:
      return {
        ...state,
        progress: 66,
      };

    default:
      return state;
  }
}

export function registerPlayer(id) {
  return {
    type: WSActionTypes.REGISTER_PLAYER_REQUEST,
    payload: { id },
  };
}

export function connectRequest() {
  return {
    type: WSActionTypes.WEBSOCKET_CONNECT_REQUEST,
  };
}

function connectSuccess(socket) {
  return {
    type: WSActionTypes.WEBSOCKET_CONNECT_SUCCESS,
    payload: { socket },
  };
}

function connectFailure(error) {
  return {
    type: WSActionTypes.WEBSOCKET_CONNECT_FAILURE,
    payload: { error },
  };
}

export function connect() {
  return (dispatch) => {
    const [, token] = document.cookie.match(/matchpoint_session=(.*?)(;|$)/);

    const socket = new Socket('ws://localhost:4000/socket', {
      params: { session_token: token },
    });
    socket.onOpen(() => {
      dispatch(connectSuccess(socket));
    });
    socket.onError(() => {
      dispatch(connectFailure());
    });
    dispatch(connectRequest());
    socket.connect();

    return Promise.resolve(socket);
  };
}

export function joinRoomSuccess() {
  return {
    type: WSActionTypes.JOIN_ROOM_SUCCESS,
  };
}

export function unregisterPlayer(id) {
  return {
    type: WSActionTypes.UNREGISTER_PLAYER_REQUEST,
    payload: { id },
  };
}

export function createPlayer({ name, rating, checked }) {
  return {
    type: WSActionTypes.CREATE_PLAYER_REQUEST,
    payload: { player: { name, rating }, checked },
  };
}

export function updatePlayer(player) {
  return {
    type: WSActionTypes.UPDATE_PLAYER_REQUEST,
    payload: { player },
  };
}

export function deletePlayer(id) {
  return {
    type: WSActionTypes.DELETE_PLAYER_REQUEST,
    payload: { id },
  };
}

export function endSession() {
  return {
    type: WSActionTypes.END_SESSION,
  };
}
