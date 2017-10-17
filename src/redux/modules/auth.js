import request from 'utils/request';
import { browserHistory } from 'react-router';
import { setPage, SET_PAGE } from 'redux/modules/splash';
import ActionTypes from 'redux/actionTypes';
import { startLoad, stopLoad } from 'redux/modules/main';
import { USER_CHANGED } from 'redux/modules/profile';

const initialState = {
  club: {},
  error: null,
  loading: false,
  loaded: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    // case CLEAR_ERROR:
    //   return {
    //     ...state,
    //     error: null,
    //   };

    // case ACTIVATE_CLUB:
    //   if (state.club._id) {
    //     return {
    //       ...state,
    //       club: {
    //         ...state.club,
    //         confirmed: true,
    //       },
    //     };
    //   }
    //   return state;
    case USER_CHANGED:
      return {
        ...state,
        club: action.payload,
      };

    case SET_PAGE:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.LOAD_AUTH_REQUEST:
    case ActionTypes.LOG_IN_REQUEST:
    case ActionTypes.SIGN_UP_REQUEST:
    case ActionTypes.LOG_OUT_REQUEST:
      return {
        ...state,
        loading: true,
        loaded: false,
        club: {},
      };

    case ActionTypes.LOG_IN_SUCCESS:
    case ActionTypes.LOAD_AUTH_SUCCESS:
    case ActionTypes.SIGN_UP_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        club: action.payload.club,
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


    case ActionTypes.LOG_OUT_SUCCESS:
      return {
        ...state,
        loading: false,
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

function loadAuthSuccess(club) {
  return {
    type: ActionTypes.LOAD_AUTH_SUCCESS,
    payload: { club },
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
    return request('/api/clubs').then(
      (res) => {
        dispatch(loadAuthSuccess(res.club));
      },
      err => dispatch(loadAuthFailure(err))
    );
  };
}

export const isAuthLoaded = (state) => {
  return state.loading && state.loaded;
};

function logInRequest() {
  return {
    type: ActionTypes.LOG_IN_REQUEST,
  };
}

function logInSuccess(club) {
  return {
    type: ActionTypes.LOG_IN_SUCCESS,
    payload: { club },
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
        browserHistory.push('/club');
        dispatch(logInSuccess(res.club));
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

function signUpSuccess(club) {
  return {
    type: ActionTypes.SIGN_UP_SUCCESS,
    payload: { club },
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
    return request('/api/clubs', {
      method: 'POST',
      body: JSON.stringify({ user }),
    }).then(
      (res) => {
        dispatch(setPage(0));
        browserHistory.push('/club');
        dispatch(signUpSuccess(res.user));
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
      },
      err => dispatch(logOutFailure(err))
    );
  };
}

export function activateClub() {
  return (dispatch) => {
    dispatch(startLoad());
    setTimeout(() => {
      browserHistory.push('/club');
      dispatch(stopLoad());
      dispatch(setPage(0));
    });
  };
}
