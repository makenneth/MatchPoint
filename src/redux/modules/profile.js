import axios from 'axios';
import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';
import { getCSRF } from 'helpers';
import { setMessage } from 'redux/modules/main';

export const USER_CHANGED = 'mp/infoChange/USER_CHANGED';

// const initialState = {
//   error: null
// };

// export default (state = initialState, action) => {
//   switch (action.type) {
//     default:
//       return state;
//   }
// };

export const changePassword = (oldPassword, newPassword) => {
  const promise = axios({
    method: 'PATCH',
    url: '/api/my?type=password',
    data: { data: { oldPassword, newPassword } },
    headers: {
      'X-CSRF-TOKEN': getCSRF(),
    },
  });

  return {
    types: ['NOT NEEDED', 'NOT_NEEDED', USER_CHANGED],
    promise,
  };
};

export const changeInfo = (info, password) => {
  const promise = axios({
    method: 'PATCH',
    url: '/api/my?type=info',
    data: {
      data: { password, info },
    },
    headers: {
      'X-CSRF-TOKEN': getCSRF(),
    },
  });

  return {
    types: ['NOT NEEDED', 'NOT_NEEDED', USER_CHANGED],
    promise,
  };
};

export function resendEmail() {
  return (dispatch) => {
    dispatch(resendEmailRequest());
    return request('/api/my/accounts/resend', {
      method: 'POST',
    }).then(
      () => {
        dispatch(setMessage('Email has been resend successfully'));
        dispatch(resendEmailSuccess());
      },
      err => {
        dispatch(setMessage('Oops. Something had gone wrong...'));
        dispatch(resendEmailFailure(err));
      }
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
