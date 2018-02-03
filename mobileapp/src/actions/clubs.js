import ActionTypes from '../constants/actionTypes';
import Request from '../utils/Request';
import { API_URL, API_KEY, TMDB_URL } from '../constants/api';

function getClubsRequest() {
  console.log(ActionTypes);
  return {
    type: ActionTypes.GET_CLUBS_REQUEST,
  };
}

function getClubsSuccess(clubs) {
  return {
    type: ActionTypes.GET_CLUBS_SUCCESS,
    clubs,
  };
}

function getClubsFailure(err) {
  return {
    type: ActionTypes.GET_CLUBS_FAILURE,
    err,
  };
}

export function getClubs() {
  return (dispatch, getState) => {
    return Request(`${API_URL}/clubs`, {
      query: {
        api_key: API_KEY
      },
    })
      .then(
        (clubs) => {
          dispatch(getClubsSuccess(clubs));
        },
        (err) => {
          dispatch(getClubsFailure(err));
        }
      );
  };
}
