import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';
import { setMessage } from 'redux/modules/main';

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

function changePasswordRequest() {
  return {
    type: ActionTypes.CHANGE_PASSWORD_REQUEST,
  };
}

function changePasswordSuccess(club) {
  return {
    type: ActionTypes.CHANGE_PASSWORD_SUCCESS,
    payload: { club },
  };
}

function changePasswordFailure(error) {
  return {
    type: ActionTypes.CHANGE_PASSWORD_FAILURE,
    payload: { error },
  };
}

export function changePassword(oldPassword, newPassword) {
  return (dispatch) => {
    dispatch(changePasswordRequest());
    return request('/api/my?type=password', {
      method: 'PATCH',
      body: JSON.stringify({ data: { oldPassword, newPassword } }),
    }).then(
      res => dispatch(changePasswordSuccess(res.club)),
      err => dispatch(changePasswordFailure(err))
    );
  };
}

// export const changeInfo = (info, password) => {
//   const promise = axios({
//     method: 'PATCH',
//     url: '/api/my?type=info',
//     data: {
//       data: { password, info },
//     },
//     headers: {
//       'X-CSRF-TOKEN': getCSRF(),
//     },
//   });

//   return {
//     types: ['NOT NEEDED', 'NOT_NEEDED', USER_CHANGED],
//     promise,
//   };
// };

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
