import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';
import { browserHistory } from 'react-router';
import { Heap } from 'helpers';
import { UPDATE_SESSION_SUCCESS } from 'redux/modules/sessions';
import { preSetTab } from 'redux/modules/navbar';
// import { RESTORE_TEMP_SESSION } from 'redux/modules/tempSession';

const initialState = {
  // prevState: null,
  loading: false,
  loaded: false,
  allPlayers: {},
  addedPlayers: new Heap(),
  date: new Date(),
  max: 7,
  min: 3,
};

export default (state = initialState, action) => {
  switch (action.type) {
    // case RESTORE_STATE:
    //   return {
    //     ...initialState,
    //     ...state.prevstate,
    //   };
    // case TEST_DATA_PARTICIPANTS: {
    //   const currentState = Object.assign({}, initialState);
    //   delete currentState.prevState;
    //   return {
    //     ...state,
    //     prevState: currentState,
    //     allPlayers: action.payload,
    //   };
    // }
    case ActionTypes.SET_MIN_AND_MAX:
      return {
        ...state,
        ...action.payload,
      };
    case ActionTypes.REGISTER_PLAYER: {
      const addedPlayers = state.addedPlayers.insert(state.allPlayers[action.payload]);
      return {
        ...state,
        addedPlayers,
      };
    }
    case ActionTypes.UNREGISTER_PLAYER: {
      const addedPlayers = state.addedPlayers.remove(action.payload);
      return {
        ...state,
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
      if (state.addedPlayers.find(action.payload.id)) {
        addedPlayers = state.addedPlayers.remove(action.payload.id);
      }

      return {
        ...state,
        allPlayers,
        addedPlayers,
      };
    }
    case ActionTypes.ADD_PLAYERS_SUCCESS: {
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
      const { player, checked } = action.payload;
      const allPlayers = Object.assign({}, state.allPlayers);
      let addedPlayers = state.addedPlayers;

      allPlayers[player.id] = player;
      if (addedPlayers.find(player.id)) {
        addedPlayers = addedPlayers.replace(player);
      } else if (checked) {
        addedPlayers = addedPlayers.insert(player);
      }
      return {
        ...state,
        allPlayers,
        addedPlayers,
        loading: false,
      };
    }

    case ActionTypes.ADD_PLAYER_SUCCESS: {
      const { player, checked } = action.payload;
      const allPlayers = Object.assign({}, state.allPlayers);
      let addedPlayers = state.addedPlayers;
      allPlayers[player.id] = player;
      if (checked) {
        addedPlayers = addedPlayers.insert(player);
      }
      return {
        ...state,
        allPlayers,
        addedPlayers,
        loading: false,
      };
    }
    case ActionTypes.SET_DATE:
      return {
        ...state,
        date: action.payload,
      };
    case ActionTypes.RESTORE_TEMP_SESSION: {
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
    case ActionTypes.CREATE_SESSION_SUCCESS:
      return {
        loading: false,
        loaded: false,
        allPlayers: {},
        addedPlayers: new Heap(),
        numJoined: 0,
        date: new Date(),
        max: null,
        min: null,
      };
    case ActionTypes.CHANGE_SCHEMA:
    case ActionTypes.MOVE_PLAYER_UP:
    case ActionTypes.MOVE_PLAYER_DOWN:
      return {
        ...state,
        addedPlayers: state.addedPlayers.removePlayerList(),
      };
    default:
      return state;
  }
};

export function setMinAndMax(min, max) {
  return {
    type: ActionTypes.SET_MIN_AND_MAX,
    payload: {
      min, max,
    },
  };
}

export function setDate(date) {
  return {
    type: ActionTypes.SET_DATE,
    payload: date,
  };
}

export function registerPlayer(id) {
  return {
    type: ActionTypes.REGISTER_PLAYER,
    payload: id,
  };
}

export function unregisterPlayer(id) {
  return {
    type: ActionTypes.UNREGISTER_PLAYER,
    payload: id,
  };
}

// export const restoreSession = (data) => {
//   return {
//     type: RESTORE_SESSION,
//     payload: data,
//   };
// };
function createSessionRequest() {
  return {
    type: ActionTypes.CREATE_SESSION_REQUEST,
  };
}

function createSessionSuccess(session) {
  return {
    type: ActionTypes.CREATE_SESSION_SUCCESS,
    payload: { session },
  };
}

function createSessionFailure(error) {
  return {
    type: ActionTypes.CREATE_SESSION_FAILURE,
    payload: { error },
  };
}

export function createSession(data) {
  return (dispatch) => {
    dispatch(createSessionRequest());

    return request('/api/my/sessions', {
      method: 'POST',
      body: JSON.stringify({ session: data }),
    }).then(
      (res) => {
        dispatch(createSessionSuccess(res.roundrobin));
        dispatch(preSetTab('/club/sessions'));
        browserHistory.push('/club/sessions');
      },
      (err) => dispatch(createSessionFailure(err))
    );
  };
}
