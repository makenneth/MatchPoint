import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';

const initialState = {
  isLoading: false,
  error: null,
  predictions: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.ADDRESS_AUTO_COMPLETE_REQUEST:
      return {
        ...state,
        isLoading: true,
        predictions: [],
      };

    case ActionTypes.ADDRESS_AUTO_COMPLETE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        predictions: action.payload.predictions,
      };

    case ActionTypes.ADDRESS_AUTO_COMPLETE_FAILURE:
      return {
        ...state,
        isLoading: false,
      };

    case ActionTypes.CLEAR_PREDICTIONS:
      return {
        ...state,
        predictions: [],
      };

    default:
      return state;
  }
};

export function clearPredictions() {
  return {
    type: ActionTypes.CLEAR_PREDICTIONS,
  };
}

function addressAutoCompleteRequest() {
  return {
    type: ActionTypes.ADDRESS_AUTO_COMPLETE_REQUEST,
  };
}

function addressAutoCompleteSuccess(predictions) {
  return {
    type: ActionTypes.ADDRESS_AUTO_COMPLETE_SUCCESS,
    payload: { predictions },
  };
}

function addressAutoCompleteFailure(err) {
  return {
    type: ActionTypes.ADDRESS_AUTO_COMPLETE_FAILURE,
    payload: { err },
  };
}

export function addressAutoComplete(query) {
  return (dispatch) => {
    if (query.length < 3) {
      dispatch(addressAutoCompleteSuccess([]));
    } else {
      dispatch(addressAutoCompleteRequest());
      return request('/api/my/geolocation/autocomplete', {
        query: { address: query },
      }).then(
        res => dispatch(addressAutoCompleteSuccess(res.predictions)),
        err => dispatch(addressAutoCompleteFailure(err))
      );
    }
  };
}
