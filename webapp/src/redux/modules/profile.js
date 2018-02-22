import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';
import { setMessage } from 'redux/modules/main';

export function passwordChange(state = {
  error: null,
  isLoading: false,
  success: false,
}, action) {
  switch (action.type) {
    case ActionTypes.CHANGE_PASSWORD_REQUEST:
      return {
        ...state,
        error: null,
        isLoading: true,
        success: false,
      };

    case ActionTypes.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        error: null,
        isLoading: false,
        success: true,
      };

    case ActionTypes.CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        success: false,
      };

    default:
      return state;
  }
}

export function infoChange(state = {
  error: null,
  isLoading: false,
  success: null,
}, action) {
  switch (action.type) {
    case ActionTypes.CHANGE_INFO_REQUEST:
      return {
        ...state,
        error: null,
        isLoading: true,
        success: null,
      };

    case ActionTypes.CHANGE_INFO_SUCCESS:
      return {
        ...state,
        error: null,
        isLoading: false,
        success: action.payload.user,
      };

    case ActionTypes.CHANGE_INFO_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        success: null,
      };

    default:
      return state;
  }
}

function changePasswordRequest() {
  return {
    type: ActionTypes.CHANGE_PASSWORD_REQUEST,
  };
}

function changePasswordSuccess(user) {
  return {
    type: ActionTypes.CHANGE_PASSWORD_SUCCESS,
    payload: { user },
  };
}

function changePasswordFailure(error) {
  return {
    type: ActionTypes.CHANGE_PASSWORD_FAILURE,
    payload: { error },
  };
}

export function changePassword(oldPassword, newPassword, email) {
  return (dispatch) => {
    dispatch(changePasswordRequest());
    return request('/api/my?type=password', {
      method: 'PATCH',
      body: JSON.stringify({ data: { oldPassword, newPassword, email } }),
    }).then(
      res => dispatch(changePasswordSuccess(res.user)),
      err => dispatch(changePasswordFailure(err))
    );
  };
}

function changeInfoRequest() {
  return {
    type: ActionTypes.CHANGE_INFO_REQUEST,
  };
}

function changeInfoSuccess(user) {
  return {
    type: ActionTypes.CHANGE_INFO_SUCCESS,
    payload: { user },
  };
}

function changeInfoFailure(error) {
  return {
    type: ActionTypes.CHANGE_INFO_FAILURE,
    payload: { error },
  };
}

export function changeInfo(info, password) {
  return (dispatch) => {
    dispatch(changeInfoRequest());
    return request('/api/my?type=info', {
      method: 'PATCH',
      body: JSON.stringify({ data: { password, info } }),
    }).then(
      res => dispatch(changeInfoSuccess(res.user)),
      err => dispatch(changeInfoFailure(err))
    );
  };
}

function resendEmailRequest() {
  return {
    type: ActionTypes.RESEND_EMAIL_REQUEST,
  };
}

function resendEmailSuccess() {
  return {
    type: ActionTypes.RESEND_EMAIL_SUCCESS,
  };
}
function resendEmailFailure(err) {
  return {
    type: ActionTypes.RESEND_EMAIL_FAILURE,
    payload: {
      err,
    },
  };
}

export function resendEmail() {
  return (dispatch) => {
    dispatch(resendEmailRequest());
    return request('/api/my/accounts/resend', {
      method: 'POST',
    }).then(
      () => {
        dispatch(setMessage('A new email is on its way.'));
        dispatch(resendEmailSuccess());
      },
      err => {
        dispatch(setMessage('Oops. Something had gone wrong...'));
        dispatch(resendEmailFailure(err));
      }
    );
  };
}
