import axios from 'axios';
import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';
import { getCSRF } from 'helpers';
import { setMessage } from 'redux/modules/main';

export const USER_CHANGED = 'mp/infoChange/USER_CHANGED';

// const initialState = {
//   isLoading: false,
//   error: null,
//   predictions: [],
// };

// export default (state = initialState, action) => {
//   switch (action.type) {
//     case ActionTypes.ADDRESS_AUTO_COMPLETE_REQUEST:
//       return {
//         ...state,
//         isLoading: true,
//       };

//     case ActionTypes.ADDRESS_AUTO_COMPLETE_SUCCESS:
//       return {
//         ...state,
//         isLoading: false,
//         predictions: action.payload.predictions,
//       };

//     case ActionTypes.ADDRESS_AUTO_COMPLETE_FAILURE:
//       return {
//         ...state,
//         isLoading: false,
//       };

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
