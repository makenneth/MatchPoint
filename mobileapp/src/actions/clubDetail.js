import ActionTypes from '../constants/actionTypes';
import Request from '../utils/Request';
import { API_URL, API_KEY } from '../constants/api';

function getClubDetailRequest() {
  return {
    type: ActionTypes.GET_CLUB_DETAIL_REQUEST,
  };
}

function getClubDetailSuccess(detail) {
  return {
    type: ActionTypes.GET_CLUB_DETAIL_SUCCESS,
    detail,
  };
}

function getClubDetailFailure(err) {
  return {
    type: ActionTypes.GET_CLUB_DETAIL_FAILURE,
    err,
  };
}

export function getClubDetail(id) {
  return (dispatch, getState) => {
    return request(`${API_URL}/clubs/${id}?api_key=${API_KEY}`)
      .then(
        (detail) => {
          dispatch(getClubDetailSuccess(detail));
        },
        (err) => {
          dispatch(getClubDetailFailure(err));
        }
      );
  };
}
