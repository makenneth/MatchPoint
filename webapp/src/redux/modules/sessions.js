import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';
import { startLoad, stopLoad, setMessage } from 'redux/modules/main';
import { push } from 'react-router-redux';

const initialState = {
  loading: false,
  loaded: false,
  sessions: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.LOG_OUT_SUCCESS:
      return initialState;
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
    dispatch(startLoad('transparent'));
    dispatch(postResultRequest());
    return request(`/api/my/sessions/${id}`, {
      method: 'POST',
      body: JSON.stringify({ results, date }),
    }).then(
      () => {
        dispatch(stopLoad());
        dispatch(push('/club/sessions'));
        dispatch(postResultSuccess(id));
      },
      err => {
        dispatch(stopLoad());
        dispatch(setMessage('Unable to save. Please try again later.'));
        dispatch(postResultFailure(err));
      },
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
    dispatch(startLoad('transparent'));
    dispatch(updateResultRequest());
    return request(`/api/my/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ results, date }),
    }).then(
      res => {
        dispatch(stopLoad());
        dispatch(updateResultSuccess(res.roundrobin));
      },
      err => {
        dispatch(stopLoad());
        dispatch(setMessage('Unable to update result.'));
        dispatch(updateResultFailure(err));
      },
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

function updateSessionDetailRequest() {
  return {
    type: ActionTypes.UPDATE_SESSION_DETAIL_REQUEST,
  };
}

function updateSessionDetailSuccess(session) {
  return {
    type: ActionTypes.UPDATE_SESSION_DETAIL_SUCCESS,
    payload: { session },
  };
}

function updateSessionDetailFailure(error) {
  return {
    type: ActionTypes.UPDATE_SESSION_DETAIL_FAILURE,
    payload: { error },
  };
}

export function updateSessionDetail(id, data) {
  return (dispatch, getState) => {
    const { session } = getState().selectedSession;
    dispatch(startLoad('transparent'));
    dispatch(updateSessionDetailRequest());
    return request(`/api/my/sessions/${id}/detail`, {
      method: 'PATCH',
      body: JSON.stringify({ session: { ...data, id: session.id } }),
    }).then(
      (res) => {
        dispatch(stopLoad('transparent'));
        dispatch(updateSessionDetailSuccess(res.roundrobin));
      },
      (err) => {
        dispatch(stopLoad('transparent'));
        dispatch(updateSessionDetailFailure(err));
      }
    );
  };
}

export function deleteSession(id) {
  return (dispatch) => {
    dispatch(startLoad('transparent'));
    dispatch(deleteSessionRequest());
    return request(`/api/my/sessions/${id}`, {
      method: 'DELETE',
    }).then(
      () => {
        dispatch(stopLoad());
        dispatch(deleteSessionSuccess(id));
        dispatch(push('/club/sessions'));
      },
      err => {
        dispatch(stopLoad());
        dispatch(setMessage('Unable to delete session, please try again later.'));
        dispatch(deleteSessionFailure(err));
      }
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
    dispatch(startLoad('transparent'));
    return request('/api/my/sessions')
      .then(
        (res) => {
          dispatch(stopLoad());
          dispatch(fetchUserRRSessionsSuccess(res.roundrobins));
        },
        (err) => {
          dispatch(stopLoad());
          dispatch(setMessage('Unable to get sessions. Please contact the administrator.'));
          dispatch(fetchUserRRSessionsFailure(err));
        }
      );
  };
}
