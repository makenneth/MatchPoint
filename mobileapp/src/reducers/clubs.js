import ActionTypes from '../constants/actionTypes';

const initialState = {
  isLoading: false,
  err: null,
  clubs: [],
  isLoaded: false,
};

export default function Clubs(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.GET_CLUBS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isLoaded: false,
        err: null,
      };

    case ActionTypes.GET_CLUBS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        clubs: action.clubs.clubs,
      };

    case ActionTypes.GET_CLUBS_FAILURE:
      return {
        ...state,
        isLoading: false,
        err: action.err,
      };

    default:
      return state;
  }
}
