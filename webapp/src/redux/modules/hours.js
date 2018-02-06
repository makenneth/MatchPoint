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

    case ActionTypes.UPDATE_CLUB_HOUR_SUCCESS:
    case ActionTypes.DELETE_CLUB_HOUR_SUCCESS:
    case ActionTypes.CREATE_CLUB_HOUR_SUCCESS:
      return {
        ...state,
      };

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
