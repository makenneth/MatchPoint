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
    case ActionTypes.LOG_OUT_SUCCESS:
      return initialState;

    case ActionTypes.FETCH_CLUB_DETAIL_REQUEST:
      return {
        ...state,
        isLoading: true,
        isLoaded: false,
      };

    case ActionTypes.FETCH_CLUB_DETAIL_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        ...action.payload,
      };

    case ActionTypes.FETCH_CLUB_DETAIL_FAILURE:
      return {
        ...state,
        isLoading: false,
      };

    case ActionTypes.CHANGE_INFO_SUCCESS:
      return {
        ...state,
        ...action.payload.user,
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

    case ActionTypes.UPDATE_CLUB_NOTE_SUCCESS: {
      const { type, note } = action.payload.note;
      return {
        ...state,
        notes: {
          ...(state.notes || {}),
          [type]: note,
        },
      };
    }

    default:
      return state;
  }
};

function fetchClubDetailRequest() {
  return {
    type: ActionTypes.FETCH_CLUB_DETAIL_REQUEST,
  };
}

function fetchClubDetailSuccess(result) {
  return {
    type: ActionTypes.FETCH_CLUB_DETAIL_SUCCESS,
    payload: { ...result },
  };
}

function fetchClubDetailFailure(err) {
  return {
    type: ActionTypes.FETCH_CLUB_DETAIL_FAILURE,
    payload: { err },
  };
}

export function fetchClubDetail() {
  return (dispatch) => {
    dispatch(fetchClubDetailRequest());
    return request('/api/my/detail').then(
      res => dispatch(fetchClubDetailSuccess(res.club)),
      err => dispatch(fetchClubDetailFailure(err))
    );
  };
}
