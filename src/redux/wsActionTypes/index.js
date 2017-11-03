import keymirror from 'keymirror';

const actionTypes = keymirror({
  REGISTER_PLAYER_REQUEST: null,
  UNREGISTER_PLAYER_REQUEST: null,
  CREATE_PLAYER_REQUEST: null,
  UPDATE_PLAYER_REQUEST: null,
  DELETE_PLAYER_REQUEST: null,
  WEBSOCKET_CONNECT_REQUEST: null,
  WEBSOCKET_CONNECT_SUCCESS: null,
  WEBSOCKET_CONNECT_FAILURE: null,
  JOIN_ROOM_SUCCESS: null,
});

export default actionTypes;
