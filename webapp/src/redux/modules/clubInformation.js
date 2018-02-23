import ActionTypes from 'redux/actionTypes';
import request from 'utils/request';
import { push } from 'react-router-redux';

const initialState = {
  isLoading: false,
  err: null,
};

export default function ClubInformation(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.CONFIG_INIT_INFORMATION_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case ActionTypes.CONFIG_INIT_INFORMATION_SUCCESS:
      return {
        ...state,
        isLoading: false,
      };

    case ActionTypes.CONFIG_INIT_INFORMATION_FAILURE:
      return {
        ...state,
        isLoading: false,
        err: action.payload.error,
      };

    default:
      return state;
  }
}

function configureInitInformationRequest() {
  return {
    type: ActionTypes.CONFIG_INIT_INFORMATION_REQUEST,
  };
}
function configureInitInformationSuccess(info) {
  return {
    type: ActionTypes.CONFIG_INIT_INFORMATION_SUCCESS,
    payload: { info },
  };
}

function configureInitInformationFailure(error) {
  return {
    type: ActionTypes.CONFIG_INIT_INFORMATION_FAILURE,
    payload: { error },
  };
}

export function configureInitInformation(info) {
  return (dispatch) => {
    dispatch(configureInitInformationRequest());
    return request('/api/my/info', {
      method: 'POST',
      body: JSON.stringify({ info }),
    }).then(
      (res) => {
        dispatch(configureInitInformationSuccess(res.info));
        dispatch(push('/club'));
      },
      (err) => dispatch(configureInitInformationFailure(err))
    );
  };
}
