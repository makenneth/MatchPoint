import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';

const initialState = {
  isLoading: false,
  error: null,
  clubs: {},
};

export default function ClubDetailSearch(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.CLUB_DETAIL_QUERY_REQUEST:
      return {
        ...state,
        isLoading: true,
      };


    case ActionTypes.CLUB_DETAIL_QUERY_SUCCESS: {
      const { club } = action.payload;
      return {
        ...state,
        isLoading: false,
        clubs: {
          ...state.clubs,
          [club.id]: club,
        },
      };
    }

    case ActionTypes.CLUB_DETAIL_QUERY_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
}

function clubDetailQueryRequest() {
  return {
    type: ActionTypes.CLUB_DETAIL_QUERY_REQUEST,
  };
}

function clubDetailQuerySuccess(club) {
  return {
    type: ActionTypes.CLUB_DETAIL_QUERY_SUCCESS,
    payload: { club },
  };
}

function clubDetailQueryFailure(error) {
  return {
    type: ActionTypes.CLUB_DETAIL_QUERY_FAILURE,
    payload: { error },
  };
}

export function clubDetailQuery(id) {
  return (dispatch) => {
    dispatch(clubDetailQueryRequest());
    return request(`/api/clubs/${id}`).then(
      data => dispatch(clubDetailQuerySuccess(data.club)),
      err => dispatch(clubDetailQueryFailure(err))
    );
  };
}
