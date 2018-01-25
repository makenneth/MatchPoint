import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';
import { closeEditModal, closeNewModal } from './modals';
import { startLoad, stopLoad, setMessage } from './main';

const initialState = {
  loaded: false,
  loading: false,
  // player: null,
  error: null,
};

export default function Players(state = initialState, action) {
  // what are these for???
  switch (action.type) {
    case ActionTypes.ADD_PLAYER_REQUEST:
    case ActionTypes.UPDATE_PLAYER_REQUEST:
    case ActionTypes.DELETE_PLAYER_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case ActionTypes.ADD_PLAYER_SUCCESS:
    case ActionTypes.UPDATE_PLAYER_SUCCESS:
    case ActionTypes.DELETE_PLAYER_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case ActionTypes.ADD_PLAYER_FAILURE:
    case ActionTypes.UPDATE_PLAYER_FAILURE:
    case ActionTypes.DELETE_PLAYER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
}

function fetchCurrentPlayersRequest() {
  return {
    type: ActionTypes.FETCH_CURRENT_PLAYERS_REQUEST,
  };
}

function fetchCurrentPlayersSuccess(players) {
  return {
    type: ActionTypes.FETCH_CURRENT_PLAYERS_SUCCESS,
    payload: { players },
  };
}

function fetchCurrentPlayersFailure(error) {
  return {
    type: ActionTypes.FETCH_CURRENT_PLAYERS_FAILURE,
    payload: { error },
  };
}

export function fetchCurrentPlayers() {
  return (dispatch) => {
    dispatch(startLoad('transparent'));
    dispatch(fetchCurrentPlayersRequest());
    return request('/api/my/players').then(
      res => {
        dispatch(fetchCurrentPlayersSuccess(res.players));
        dispatch(stopLoad());
      },
      err => {
        dispatch(fetchCurrentPlayersFailure(err));
        dispatch(stopLoad());
        dispatch(setMessage('Something went wrong... please try again.'));
      }
    );
  };
}

function fetchPromotedPlayersRequest() {
  return {
    type: ActionTypes.FETCH_PROMOTED_PLAYERS_REQUEST,
  };
}

function fetchPromotedPlayersSuccess(promoted) {
  return {
    type: ActionTypes.FETCH_PROMOTED_PLAYERS_SUCCESS,
    payload: { promoted },
  };
}

function fetchPromotedPlayersFailure(error) {
  return {
    type: ActionTypes.FETCH_PROMOTED_PLAYERS_FAILURE,
    payload: { error },
  };
}

export function fetchPromotedPlayers() {
  return (dispatch) => {
    dispatch(fetchPromotedPlayersRequest());
    return request('/api/my/players/promotion').then(
      res => {
        dispatch(fetchPromotedPlayersSuccess(res.promoted));
        dispatch(stopLoad());
      },
      err => {
        dispatch(fetchPromotedPlayersFailure(err));
        dispatch(stopLoad());
        dispatch(setMessage('Something went wrong... please try again.'));
      }
    );
  };
}

function addPlayerRequest() {
  return {
    type: ActionTypes.ADD_PLAYER_REQUEST,
  };
}

function addPlayerSuccess(player, checked) {
  return {
    type: ActionTypes.ADD_PLAYER_SUCCESS,
    payload: { player, checked },
  };
}

function addPlayerFailure(error) {
  return {
    type: ActionTypes.ADD_PLAYER_FAILURE,
    payload: { error },
  };
}

export function addPlayer({ name, rating, checked }) {
  return (dispatch) => {
    const player = { name, rating };
    dispatch(addPlayerRequest());
    return request('/api/my/players', {
      method: 'POST',
      body: JSON.stringify({ player }),
    }).then(
      res => {
        dispatch(closeNewModal());
        dispatch(addPlayerSuccess(res.player, checked));
      },
      err => dispatch(addPlayerFailure(err))
    );
  };
}

function updatePlayerRequest() {
  return {
    type: ActionTypes.UPDATE_PLAYER_REQUEST,
  };
}

function updatePlayerSuccess(player, checked) {
  return {
    type: ActionTypes.UPDATE_PLAYER_SUCCESS,
    payload: { player, checked },
  };
}

function updatePlayerFailure(error) {
  return {
    type: ActionTypes.UPDATE_PLAYER_FAILURE,
    payload: { error },
  };
}

export function updatePlayer({ name, rating, id, checked }) {
  return (dispatch) => {
    dispatch(updatePlayerRequest());
    const player = { name, rating, id };
    return request(`/api/my/players/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ player }),
    }).then(
      res => {
        dispatch(closeEditModal());
        dispatch(updatePlayerSuccess(res.player, checked));
      },
      err => dispatch(updatePlayerFailure(err))
    );
  };
}

function deletePlayerRequest() {
  return {
    type: ActionTypes.DELETE_PLAYER_REQUEST,
  };
}

function deletePlayerSuccess(id) {
  return {
    type: ActionTypes.DELETE_PLAYER_SUCCESS,
    payload: { id },
  };
}

function deletePlayerFailure(error) {
  return {
    type: ActionTypes.DELETE_PLAYER_FAILURE,
    payload: { error },
  };
}

export function deletePlayer(id) {
  return (dispatch) => {
    dispatch(deletePlayerRequest());
    return request(`/api/my/players/${id}`, {
      method: 'DELETE',
    }).then(
      res => dispatch(deletePlayerSuccess(res.playerId)),
      err => dispatch(deletePlayerFailure(err))
    );
  };
}
