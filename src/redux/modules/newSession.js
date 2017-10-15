import axios from 'axios';
import ActionTypes from 'redux/actionTypes';
import { getCSRF, Heap } from 'helpers';
import { UPDATE_SESSION_SUCCESS } from 'redux/modules/sessions';
import {
  CHANGE_SCHEMA,
  MOVE_PLAYER_UP,
  MOVE_PLAYER_DOWN,
} from 'redux/modules/schemata';
import { MESSAGE, LOAD } from 'redux/modules/main';
import { RESTORE_TEMP_SESSION } from 'redux/modules/tempSession';

export const RESTORE_STATE = 'mp/session/RESTORE_STATE';
export const TEST_DATA_PARTICIPANTS = 'mp/session/TEST_DATA_PARTICIPANTS';
export const TEST_DATA_GROUPING = 'mp/session/TEST_DATA_GROUPING';
export const NEW_SESSION = 'mp/session/';
export const LOAD_PLAYERS = 'mp/session/LOAD_PLAYERS';
export const SET_MIN_AND_MAX = 'mp/session/SET_MIN_AND_MAX';
export const PLAYERS_FAIL = 'mp/session/FETCH_PLAYERS';
export const RESTORE_SESSION = 'mp/session/RESTORE_SESSION';
export const ADD_PLAYERS_SUCCESS = 'mp/session/ADD_PLAYERS_SUCCESS';
export const REGISTER_PLAYER = 'mp/session/REGISTER_PLAYER';
export const UNREGISTER_PLAYER = 'mp/session/UNREGISTER_PLAYER';
export const SAVE_SESSION_SUCCESS = 'mp/session/SAVE_SESSION_SUCCESS';

const SET_DATE = 'mp/rr/SET_DATE';

const initialState = {
  prevState: null,
  loading: false,
  loaded: false,
  allPlayers: {},
  addedPlayers: new Heap(),
  numJoined: 0,
  date: new Date(),
  pdfs: null,
  max: 7,
  min: 3,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESTORE_STATE:
      return {
        ...initialState,
        ...state.prevstate,
      };
    case TEST_DATA_PARTICIPANTS: {
      const currentState = Object.assign({}, initialState);
      delete currentState.prevState;
      return {
        ...state,
        prevState: currentState,
        allPlayers: action.payload,
      };
    }
    case SET_MIN_AND_MAX:
      return {
        ...state,
        ...action.payload,
      };
    case REGISTER_PLAYER: {
      const addedPlayers = state.addedPlayers.insert(state.allPlayers[action.payload]);
      const numJoined = state.numJoined + 1;
      return {
        ...state,
        numJoined,
        addedPlayers,
      };
    }
    case UNREGISTER_PLAYER: {
      const addedPlayers = state.addedPlayers.remove(action.payload);
      const numJoined = state.numJoined - 1;
      return {
        ...state,
        numJoined,
        addedPlayers,
      };
    }

    case ActionTypes.FETCH_CURRENT_PLAYERS_SUCCESS: {
      const allPlayers = {};
      action.payload.players.forEach((player) => {
        allPlayers[player.id] = player;
      });

      return {
        ...state,
        allPlayers,
        loading: false,
        loaded: true,
        players: action.payload.players,
      };
    }
    case ActionTypes.DELETE_PLAYER_SUCCESS: {
      const allPlayers = Object.assign({}, state.allPlayers);
      delete allPlayers[action.payload.id];
      let addedPlayers = state.addedPlayers;
      let numJoined = state.numJoined;
      if (state.addedPlayers.find(action.payload.id)) {
        addedPlayers = state.addedPlayers.remove(action.payload.id);
        numJoined -= 1;
      }

      return {
        ...state,
        allPlayers,
        addedPlayers,
        numJoined,
      };
    }
    case ADD_PLAYERS_SUCCESS: {
      const allPlayers = Object.assign({}, state.allPlayers);
      action.payload.forEach((player) => {
        allPlayers[player.id] = player;
      });
      return {
        ...state,
        allPlayers,
        loading: false,
      };
    }
    case ActionTypes.UPDATE_PLAYER_SUCCESS: {
      const { player } = action.payload;
      const allPlayers = Object.assign({}, state.allPlayers);
      allPlayers[player.id] = player;
      return {
        ...state,
        allPlayers,
        addedPlayers: state.addedPlayers.replace(player),
        loading: false,
      };
    }

    case ActionTypes.ADD_PLAYER_SUCCESS: {
      const allPlayers = Object.assign({}, state.allPlayers);
      allPlayers[action.payload.player.id] = action.payload.player;
      return {
        ...state,
        allPlayers,
        loading: false,
      };
    }
    case SET_DATE:
      return {
        ...state,
        date: action.payload,
      };
    case LOAD_PLAYERS:
      return {
        ...state,
        loading: true,
      };
    case RESTORE_TEMP_SESSION: {
      const { addedPlayers: { heap, map }, date } = action.payload;
      return {
        ...state,
        ...action.payload,
        addedPlayers: new Heap(heap, map),
        date: new Date(date),
      };
    }
    case UPDATE_SESSION_SUCCESS:
      return {
        ...state,
        loaded: false,
      };
    case SAVE_SESSION_SUCCESS:
      return {
        loading: false,
        loaded: false,
        allPlayers: {},
        addedPlayers: new Heap(),
        numJoined: 0,
        date: new Date(),
        pdfs: null,
        max: null,
        min: null,
      };
    case CHANGE_SCHEMA:
    case MOVE_PLAYER_UP:
    case MOVE_PLAYER_DOWN:
      return {
        ...state,
        addedPlayers: state.addedPlayers.removePlayerList(),
      };
    default:
      return state;
  }
};

export const setMinAndMax = (min, max) => {
  return {
    type: SET_MIN_AND_MAX,
    payload: {
      min, max,
    },
  };
};

export const setDate = (date) => {
  return {
    type: SET_DATE,
    payload: date,
  };
};

export const registerPlayer = (id) => {
  return {
    type: REGISTER_PLAYER,
    payload: id,
  };
};

export const unregisterPlayer = (id) => {
  return {
    type: UNREGISTER_PLAYER,
    payload: id,
  };
};

export const restoreSession = (data) => {
  return {
    type: RESTORE_SESSION,
    payload: data,
  };
};

export const saveSession = (data) => {
  const promise = axios({
    url: '/api/my/session',
    method: 'POST',
    data: { session: data },
    headers: {
      'X-CSRF-TOKEN': getCSRF(),
    },
  });

  return {
    types: [LOAD, SAVE_SESSION_SUCCESS, MESSAGE],
    promise,
  };
};
