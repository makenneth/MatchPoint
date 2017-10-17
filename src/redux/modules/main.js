// import ActionTypes from 'redux/actionTypes';
export const LOAD = 'mp/main/LOAD';
export const STOP_LOAD = 'mp/main/STOP_LOAD';
export const MESSAGE = 'mp/main/MESSAGE';
const CLEAR_ERROR = 'mp/main/CLEAR_ERROR';

const initialState = {
  loading: false,
  message: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case STOP_LOAD:
      return {
        ...state,
        loading: false,
      };
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case MESSAGE:
      return {
        ...state,
        message: action.payload,
        loading: false,
      };
    case CLEAR_ERROR:
      return {
        ...state,
        message: null,
      };
    default:
      return state;
  }
};

export function startLoad() {
  return {
    type: LOAD,
  };
}

export function stopLoad() {
  return {
    type: STOP_LOAD,
  };
}

export function clearMessage() {
  return {
    type: CLEAR_ERROR,
  };
}

export function setMessage(msg) {
  return {
    type: MESSAGE,
    payload: msg,
  };
}
