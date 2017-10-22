import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';
import { startLoad, stopLoad } from 'redux/modules/main';
import { browserHistory } from 'react-router';

const initialState = {
  loading: false,
  loaded: false,
  sessions: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.LOAD_SESSIONS_SUCCESS: {
      return {
        ...state,
        loading: false,
        loaded: true,
        sessions: action.payload.sessions,
      };
    }
    case ActionTypes.POST_SESSION_SUCCESS: {
      const sessions = [];
      for (const session of state.sessions) {
        if (session.short_id === action.payload.id) {
          sessions.push({
            ...session,
            finalized: 1,
          });
        } else {
          sessions.push(session);
        }
      }

      return {
        ...state,
        loading: false,
        sessions,
      };
    }
    case ActionTypes.UPDATE_SESSION_SUCCESS: {
      const sessions = [];
      for (const session of state.sessions) {
        if (session.id === action.payload.session.id) {
          sessions.push(action.payload.session);
        } else {
          sessions.push(session);
        }
      }

      return {
        ...state,
        loading: false,
        sessions,
      };
    }
    case ActionTypes.CREATE_SESSION_SUCCESS: {
      return {
        ...state,
        loading: false,
        sessions: [...state.sessions, action.payload.session],
      };
    }
    case ActionTypes.DELETE_SESSION_SUCCESS:
      return {
        ...state,
        loading: false,
        sessions: state.sessions.filter(s => s.short_id !== action.payload.id),
      };

    case ActionTypes.LOAD_SESSIONS_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    default:
      return state;
  }
};

function postResultRequest() {
  return {
    type: ActionTypes.POST_SESSION_REQUEST,
  };
}

function postResultSuccess(id) {
  return {
    type: ActionTypes.POST_SESSION_SUCCESS,
    payload: { id },
  };
}

function postResultFailure(error) {
  return {
    type: ActionTypes.POST_SESSION_FAILURE,
    payload: { error },
  };
}

export function postResult(id, date, results) {
  return (dispatch) => {
    dispatch(postResultRequest());
    return request(`/api/my/sessions/${id}`, {
      method: 'POST',
      body: JSON.stringify({ results, date }),
    }).then(
      res => {
        browserHistory.push('/club/sessions');
        dispatch(postResultSuccess(id));
      },
      err => dispatch(postResultFailure(err)),
    );
  };
}

function updateResultRequest() {
  return {
    type: ActionTypes.UPDATE_SESSION_REQUEST,
  };
}

function updateResultSuccess(session) {
  return {
    type: ActionTypes.UPDATE_SESSION_SUCCESS,
    payload: { session },
  };
}

function updateResultFailure(error) {
  return {
    type: ActionTypes.UPDATE_SESSION_FAILURE,
    payload: { error },
  };
}

export function updateResult(id, date, results) {
  return (dispatch) => {
    dispatch(updateResultRequest());
    return request(`/api/my/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ results, date }),
    }).then(
      res => dispatch(updateResultSuccess(res.roundrobin)),
      err => dispatch(updateResultFailure(err)),
    );
  };
}

function deleteSessionRequest() {
  return {
    type: ActionTypes.DELETE_SESSION_REQUEST,
  };
}

function deleteSessionSuccess(id) {
  return {
    type: ActionTypes.DELETE_SESSION_SUCCESS,
    payload: { id },
  };
}

function deleteSessionFailure(error) {
  return {
    type: ActionTypes.DELETE_SESSION_FAILURE,
    payload: { error },
  };
}

export function deleteSession(id) {
  return (dispatch) => {
    dispatch(deleteSessionRequest());
    return request(`/api/my/sessions/${id}`, {
      method: 'DELETE',
    }).then(
      () => dispatch(deleteSessionSuccess(id)),
      err => dispatch(deleteSessionFailure(err)),
    );
  };
}

function fetchUserRRSessionsRequest() {
  return {
    type: ActionTypes.LOAD_SESSIONS_REQUEST,
  };
}

function fetchUserRRSessionsSuccess(sessions) {
  return {
    type: ActionTypes.LOAD_SESSIONS_SUCCESS,
    payload: { sessions },
  };
}

function fetchUserRRSessionsFailure(error) {
  return {
    type: ActionTypes.LOAD_SESSIONS_FAILURE,
    payload: { error },
  };
}

export function fetchUserRRSessions() {
  return (dispatch) => {
    dispatch(fetchUserRRSessionsRequest());
    dispatch(startLoad());
    return request('/api/my/sessions')
      .then(
        (res) => {
          dispatch(stopLoad());
          dispatch(fetchUserRRSessionsSuccess(res.roundrobins));
        },
        (err) => {
          dispatch(stopLoad());
          dispatch(fetchUserRRSessionsFailure(err));
        }
      );
  };
}
