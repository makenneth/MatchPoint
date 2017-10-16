import axios from 'axios';
import ActionTypes from 'redux/actionTypes';
import { getCSRF } from 'helpers';
import { LOAD, MESSAGE } from 'redux/modules/main';

export const DELETE_SESSION_SUCCESS = 'mp/sessions/DELETE_SESSION_SUCCESS';
export const UPDATE_SESSION_SUCCESS = 'mp/sessions/UPDATE_SESSION_SUCCESS';
export const LOAD_SESSIONS = 'mp/sessions/LOAD_SESSIONS';
export const LOAD_SESSIONS_ERROR = 'mp/sessions/LOAD_SESSIONS_ERROR';
export const LOAD_SESSIONS_SUCCESS = 'mp/sessions/LOAD_SESSIONS_SUCCESS';

const initialState = {
  loading: false,
  loaded: false,
  sessions: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SESSIONS_SUCCESS: {
      return {
        ...state,
        loading: false,
        loaded: true,
        sessions: action.payload,
      };
    }
    case UPDATE_SESSION_SUCCESS: {
      const sessions = [];
      for (let i = 0; i < state.sessions.length; i++) {
        if (state.sessions[i]._id === action.payload._id) {
          sessions.push(action.payload);
        } else {
          sessions.push(state.sessions[i]);
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
    case DELETE_SESSION_SUCCESS: {
      const sessions = [];
      for (let i = 0; i < state.sessions.length; i++) {
        if (state.sessions[i].id !== action.payload) {
          sessions.push(state.sessions[i]);
        }
      }

      return {
        ...state,
        loading: false,
        sessions,
      };
    }
    case LOAD_SESSIONS_ERROR:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    default:
      return state;
  }
};


export const postResult = (id, date, results) => {
  const promise = axios({
    url: `/api/my/sessions/${id}`,
    method: 'POST',
    data: {
      result: { results, date },
    },
    headers: {
      'X-CSRF-TOKEN': getCSRF(),
    },
  });

  return {
    types: [LOAD, UPDATE_SESSION_SUCCESS, MESSAGE],
    promise,
  };
};
export const updateResult = (data, ratingUpdateList, id, date) => {
  const promise = axios({
    url: `/api/my/sessions/${id}`,
    method: 'PATCH',
    data: {
      result: { date, data, ratingUpdateList },
    },
    headers: {
      'X-CSRF-TOKEN': getCSRF(),
    },
  });

  return {
    types: [LOAD, UPDATE_SESSION_SUCCESS, MESSAGE],
    promise,
  };
};

export const deleteSession = (id) => {
  const promise = axios({
    url: `/api/my/sessions/${id}`,
    method: 'DELETE',
    headers: {
      'X-CSRF-TOKEN': getCSRF(),
    },
  });

  return {
    types: [LOAD, DELETE_SESSION_SUCCESS, MESSAGE],
    promise,
  };
};

export const fetchUserRRSessions = () => {
  return {
    types: [LOAD_SESSIONS_SUCCESS, LOAD_SESSIONS_SUCCESS, LOAD_SESSIONS_ERROR],
    promise: axios('/api/my/sessions'),
  };
};
