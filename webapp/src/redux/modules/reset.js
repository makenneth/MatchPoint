import ActionTypes from 'redux/actionTypes';
import request from 'utils/request';

const initialState = {
  token: null,
  success: false,
  isLoading: false,
  error: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.RESET_PASSWORD_REQUEST:
    case ActionTypes.RESET_PASSWORD_REQUEST_REQUEST:
      return {
        ...state,
        success: false,
        isLoading: true,
      };
    case ActionTypes.RESET_PASSWORD_SUCCESS:
    case ActionTypes.RESET_PASSWORD_REQUEST_SUCCESS:
      return {
        ...state,
        success: true,
        isLoading: false,
      };
    case ActionTypes.RESET_PASSWORD_FAILURE:
    case ActionTypes.RESET_PASSWORD_REQUEST_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case ActionTypes.SET_PASSWORD_TOKEN:
      return {
        ...state,
        token: action.payload.token,
      };
    // case CHANGE_ERROR:
    // case SET_ERROR:
    //   return {
    //     token: null,
    //     success: false,
    //   };
    default:
      return state;
  }
};

function resetPasswordRequestRequest() {
  return {
    type: ActionTypes.RESET_PASSWORD_REQUEST_REQUEST,
  };
}

function resetPasswordRequestSuccess() {
  return {
    type: ActionTypes.RESET_PASSWORD_REQUEST_SUCCESS,
  };
}

function resetPasswordRequestFailure(error) {
  return {
    type: ActionTypes.RESET_PASSWORD_REQUEST_FAILURE,
    payload: { error },
  };
}

export function resetPasswordRequest(type, value) {
  return (dispatch) => {
    dispatch(resetPasswordRequestRequest());
    return request(`/accounts/reset/request?${type}=${value}`, {
      method: 'POST',
      query: { [type]: value },
    }).then(
      (res) => dispatch(resetPasswordRequestSuccess(res)),
      (err) => dispatch(resetPasswordRequestFailure(err))
    );
  };
}

function resetPasswordReq() {
  return {
    type: ActionTypes.RESET_PASSWORD_REQUEST,
  };
}

function resetPasswordSuccess() {
  return {
    type: ActionTypes.RESET_PASSWORD_SUCCESS,
  };
}

function resetPasswordFailure(error) {
  return {
    type: ActionTypes.RESET_PASSWORD_FAILURE,
    payload: { error },
  };
}

export function resetPassword(token, newPassword) {
  return (dispatch) => {
    dispatch(resetPasswordReq());
    return request('/accounts/reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }).then(
      () => dispatch(resetPasswordSuccess()),
      err => dispatch(resetPasswordFailure(err))
    );
  };
}

// export const changePassword = (data) => {
//   const promise = axios({
//     method: 'POST',
//     url: '/api/my/account/password',
//     data,
//     headers: {
//       'X-CSRF-TOKEN': getCSRF(),
//     },
//   });

//   return {
//     types: ['NOT NEEDED', 'NOT NEEDED', 'NOT NEEDED'],
//     promise,
//   };
// };


export function setToken(token) {
  return {
    type: ActionTypes.SET_PASSWORD_TOKEN,
    payload: { token },
  };
}
