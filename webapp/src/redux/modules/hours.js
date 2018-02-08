import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';

const initialState = {
  isLoading: false,
  error: null,
  roundrobinHours: [],
  operationHours: [],
  isLoaded: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_CLUB_HOURS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isLoaded: false,
      };

    case ActionTypes.FETCH_CLUB_HOURS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        roundrobinHours: action.payload.roundrobinHours,
        operationHours: action.payload.operationHours,
      };

    case ActionTypes.FETCH_CLUB_HOURS_FAILURE:
      return {
        ...state,
        isLoading: false,
      };

    case ActionTypes.ADD_CLUB_HOUR_SUCCESS: {
      const { hour } = action.payload;
      const targetHours = state[`${hour.type}Hours`];
      const dayHours = targetHours[hour.day].concat(hour);
      return {
        ...state,
        [`${hour.type}Hours`]: [
          ...targetHours.slice(0, hour.day),
          dayHours.sort((a, b) => new Date(a.open) - new Date(b.open)),
          ...targetHours.slice(hour.day + 1),
        ],
      };
    }

    case ActionTypes.DELETE_CLUB_HOUR_SUCCESS: {
      const { hour } = action.payload;
      const targetHours = state[`${hour.type}Hours`];
      const dayHours = targetHours[hour.day].filter((h) => (
        h.id !== hour.id
      ));
      return {
        ...state,
        [`${hour.type}Hours`]: [
          ...targetHours.slice(0, hour.day),
          dayHours,
          ...targetHours.slice(hour.day + 1),
        ],
      };
    }

    case ActionTypes.UPDATE_CLUB_HOUR_SUCCESS: {
      const { hour } = action.payload;
      const targetHours = state[`${hour.type}Hours`];
      const dayHours = targetHours[hour.day].map((h) => (
        h.id === hour.id ? hour : h
      ));
      return {
        ...state,
        [`${hour.type}Hours`]: [
          ...targetHours.slice(0, hour.day),
          dayHours,
          ...targetHours.slice(hour.day + 1),
        ],
      };
    }

    default:
      return state;
  }
};

function fetchClubHoursRequest() {
  return {
    type: ActionTypes.FETCH_CLUB_HOURS_REQUEST,
  };
}

function fetchClubHoursSuccess(result) {
  return {
    type: ActionTypes.FETCH_CLUB_HOURS_SUCCESS,
    payload: { ...result },
  };
}

function fetchClubHoursFailure(err) {
  return {
    type: ActionTypes.FETCH_CLUB_HOURS_FAILURE,
    payload: { err },
  };
}

export function fetchClubHours() {
  return (dispatch) => {
    dispatch(fetchClubHoursRequest());
    return request('/api/my/hours').then(
      res => dispatch(fetchClubHoursSuccess(res.hours)),
      err => dispatch(fetchClubHoursFailure(err))
    );
  };
}
