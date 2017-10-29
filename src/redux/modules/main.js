// import ActionTypes from 'redux/actionTypes';
const LOAD = 'mp/main/LOAD';
const STOP_LOAD = 'mp/main/STOP_LOAD';
const MESSAGE = 'mp/main/MESSAGE';
const CLEAR_ERROR = 'mp/main/CLEAR_ERROR';

const initialState = {
  loading: false,
  message: null,
  spinnerMode: null,
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
        spinnerMode: action.payload.mode,
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

export function startLoad(mode) {
  return {
    type: LOAD,
    payload: { mode },
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
