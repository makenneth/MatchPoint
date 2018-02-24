import request from 'utils/request';
import { push } from 'react-router-redux';
import { setPage, SET_PAGE } from 'redux/modules/splash';
import ActionTypes from 'redux/actionTypes';
import { startLoad, stopLoad } from 'redux/modules/main';

const initialState = {
  user: {},
  error: null,
  loading: false,
  loaded: false,
  geolocationKey: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    // case CLEAR_ERROR:
    //   return {
    //     ...state,
    //     error: null,
    //   };

    // case ACTIVATE_CLUB:
    //   if (state.user._id) {
    //     return {
    //       ...state,
    //       user: {
    //         ...state.user,
    //         confirmed: true,
    //       },
    //     };
    //   }
    //   return state;

    case SET_PAGE:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.LOAD_AUTH_REQUEST:
    case ActionTypes.LOG_IN_REQUEST:
    case ActionTypes.SIGN_UP_REQUEST:
      return {
        ...state,
        loading: true,
        loaded: false,
        user: {},
      };

    case ActionTypes.LOG_IN_SUCCESS:
    case ActionTypes.LOAD_AUTH_SUCCESS:
    case ActionTypes.SIGN_UP_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        user: action.payload.user,
      };

    case ActionTypes.LOG_IN_FAILURE:
    case ActionTypes.LOAD_AUTH_FAILURE:
    case ActionTypes.SIGN_UP_FAILURE:
    case ActionTypes.LOG_OUT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    case ActionTypes.LOG_OUT_REQUEST:
      return {
        ...state,
        user: {},
        loading: true,
      };

    case ActionTypes.LOG_OUT_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    // case ActionTypes.CHANGE_INFO_SUCCESS:
    case ActionTypes.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
      };

    case ActionTypes.CONFIG_INIT_INFORMATION_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          clubName: action.payload.club.clubName,
        },
      };

    default:
      return state;
  }
};

function loadAuthRequest() {
  return {
    type: ActionTypes.LOAD_AUTH_REQUEST,
  };
}

function loadAuthSuccess(user) {
  return {
    type: ActionTypes.LOAD_AUTH_SUCCESS,
    payload: { user },
  };
}

function loadAuthFailure(error) {
  return {
    type: ActionTypes.LOAD_AUTH_FAILURE,
    payload: { error },
  };
}

export function loadAuth() {
  return (dispatch) => {
    dispatch(loadAuthRequest());
    return request('/api/users').then(
      (res) => {
        dispatch(loadAuthSuccess(res.user));
      },
      err => dispatch(loadAuthFailure(err))
    );
  };
}

export const isAuthLoaded = (state) => {
  return !state.loading && state.loaded;
};

function logInRequest() {
  return {
    type: ActionTypes.LOG_IN_REQUEST,
  };
}

function logInSuccess(user) {
  return {
    type: ActionTypes.LOG_IN_SUCCESS,
    payload: { user },
  };
}

function logInFailure(error) {
  return {
    type: ActionTypes.LOG_IN_FAILURE,
    payload: { error },
  };
}

export function logIn(user) {
  return (dispatch) => {
    dispatch(logInRequest());
    return request('/session', {
      method: 'POST',
      body: JSON.stringify({ user }),
    }).then(
      (res) => {
        dispatch(logInSuccess(res.user));
        dispatch(push('/club'));
      },
      err => dispatch(logInFailure(err))
    );
  };
}

function signUpRequest() {
  return {
    type: ActionTypes.SIGN_UP_REQUEST,
  };
}

function signUpSuccess(user) {
  return {
    type: ActionTypes.SIGN_UP_SUCCESS,
    payload: { user },
  };
}

function signUpFailure(error) {
  return {
    type: ActionTypes.SIGN_UP_FAILURE,
    payload: { error },
  };
}

export function signUp(user) {
  return (dispatch) => {
    dispatch(signUpRequest());
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify({ user }),
    }).then(
      (res) => {
        dispatch(setPage(0));
        dispatch(signUpSuccess(res.user));
        dispatch(push('/club/info'));
      },
      err => dispatch(signUpFailure(err))
    );
  };
}

function logOutRequest() {
  return {
    type: ActionTypes.LOG_OUT_REQUEST,
  };
}

function logOutSuccess() {
  return {
    type: ActionTypes.LOG_OUT_SUCCESS,
  };
}

function logOutFailure(error) {
  return {
    type: ActionTypes.LOG_OUT_FAILURE,
    payload: { error },
  };
}

export function logOut() {
  return (dispatch) => {
    dispatch(logOutRequest());
    return request('/session', {
      method: 'DELETE',
    }).then(
      () => {
        dispatch(logOutSuccess());
        dispatch(push('/'));
      },
      err => dispatch(logOutFailure(err))
    );
  };
}

export function activateClub() {
  return (dispatch) => {
    dispatch(startLoad());
    setTimeout(() => {
      dispatch(stopLoad());
      dispatch(setPage(1));
    }, 1000);
  };
}
