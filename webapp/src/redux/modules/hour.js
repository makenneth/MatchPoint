import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';

const initialState = {
  isLoading: false,
  error: null,
  type: null,
  hourType: null,
};

export default function Hour(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CLUB_HOUR_REQUEST:
    case ActionTypes.ADD_CLUB_HOUR_REQUEST:
      return {
        ...state,
        isLoading: true,
        type: action.type.split('_')[0],
        hourType: action.payload.hourType,
      };

    case ActionTypes.DELETE_CLUB_HOUR_REQUEST:
      return {
        ...state,
        isLoading: true,
        type: action.type.split('_')[0],
      };

    case ActionTypes.UPDATE_CLUB_HOUR_SUCCESS:
    case ActionTypes.DELETE_CLUB_HOUR_SUCCESS:
    case ActionTypes.ADD_CLUB_HOUR_SUCCESS:
      return {
        ...state,
        isLoading: false,
        type: null,
        hourType: null,
      };

    case ActionTypes.UPDATE_CLUB_HOUR_FAILURE:
    case ActionTypes.DELETE_CLUB_HOUR_FAILURE:
    case ActionTypes.ADD_CLUB_HOUR_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
        type: null,
        hourType: null,
      };

    default:
      return state;
  }
}

function updateClubHourRequest() {
  return {
    type: ActionTypes.UPDATE_CLUB_HOUR_REQUEST,
  };
}

function updateClubHourSuccess(hourId) {
  return {
    type: ActionTypes.UPDATE_CLUB_HOUR_SUCCESS,
    payload: { hourId },
  };
}

function updateClubHourFailure(err) {
  return {
    type: ActionTypes.UPDATE_CLUB_HOUR_FAILURE,
    payload: { err },
  };
}

export function updateClubHour(id, type, hours) {
  return (dispatch) => {
    dispatch(updateClubHourRequest());
    return request('/api/my/hours', {
      method: 'PATCH',
      body: JSON.stringify({ type, hours }),
    }).then(
      res => dispatch(updateClubHourSuccess(res.hours)),
      err => dispatch(updateClubHourFailure(err))
    );
  };
}
function addClubHourRequest(hourType) {
  return {
    type: ActionTypes.ADD_CLUB_HOUR_REQUEST,
    payload: { hourType },
  };
}

function addClubHourSuccess(hour) {
  return {
    type: ActionTypes.ADD_CLUB_HOUR_SUCCESS,
    payload: { hour },
  };
}

function addClubHourFailure(err) {
  return {
    type: ActionTypes.ADD_CLUB_HOUR_FAILURE,
    payload: { err },
  };
}

export function addClubHour(type, hours) {
  return (dispatch) => {
    dispatch(addClubHourRequest(type));
    return request('/api/my/hours', {
      method: 'POST',
      body: JSON.stringify({ type, hours }),
    }).then(
      res => dispatch(addClubHourSuccess(res.hour)),
      err => dispatch(addClubHourFailure(err))
    );
  };
}

function deleteClubHourRequest() {
  return {
    type: ActionTypes.DELETE_CLUB_HOUR_REQUEST,
  };
}

function deleteClubHourSuccess(hour) {
  return {
    type: ActionTypes.DELETE_CLUB_HOUR_SUCCESS,
    payload: { hour },
  };
}

function deleteClubHourFailure(err) {
  return {
    type: ActionTypes.DELETE_CLUB_HOUR_FAILURE,
    payload: { err },
  };
}

export function deleteClubHour(hour) {
  return (dispatch) => {
    console.log(hour);
    dispatch(deleteClubHourRequest());
    return request(`/api/my/hours/${hour.id}`, {
      method: 'DELETE',
    }).then(
      () => dispatch(deleteClubHourSuccess(hour)),
      err => dispatch(deleteClubHourFailure(err))
    );
  };
}
