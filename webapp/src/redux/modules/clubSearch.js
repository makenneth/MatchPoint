import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';

const initialState = {
  isLoading: false,
  error: null,
  clubs: [],
};

export default function ClubSearch(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SEARCH_CLUBS_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case ActionTypes.SEARCH_CLUBS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        clubs: action.payload.clubs,
      };

    case ActionTypes.SEARCH_CLUBS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
}

function searchClubsRequest() {
  return {
    type: ActionTypes.SEARCH_CLUBS_REQUEST,
  };
}

function searchClubsSuccess(clubs) {
  return {
    type: ActionTypes.SEARCH_CLUBS_SUCCESS,
    payload: { clubs },
  };
}

function searchClubsFailure(error) {
  return {
    type: ActionTypes.SEARCH_CLUBS_FAILURE,
    payload: { error },
  };
}

export function searchClubs(search) {
  return (dispatch) => {
    if (search.length === 0) {
      dispatch(searchClubsSuccess([]));
      return;
    }
    dispatch(searchClubsRequest());
    return request('/api/clubs', {
      query: { search },
    }).then(
      data => dispatch(searchClubsSuccess(data.clubs)),
      err => dispatch(searchClubsFailure(err))
    );
  };
}
