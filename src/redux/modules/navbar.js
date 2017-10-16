import ActionTypes from 'redux/actionTypes';

const initialState = {
  opened: false,
  tab: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.OPEN_NAV:
      return {
        ...state,
        opened: true,
      };
    case ActionTypes.OPEN_LOGIN:
    case ActionTypes.LOG_OUT_REQUEST:
      return {
        opened: false,
        tab: 0,
      };
    case ActionTypes.CLOSE_NAV:
      return {
        ...state,
        opened: false,
      };
    case ActionTypes.SET_TAB:
      return {
        ...state,
        tab: action.payload,
        opened: false,
      };
    case ActionTypes.PRE_SET_TAB:
      return {
        ...state,
        tab: action.payload,
      };
    default:
      return state;
  }
};

export function open() {
  return {
    type: ActionTypes.OPEN_NAV,
  };
}

export function close() {
  return {
    type: ActionTypes.CLOSE_NAV,
  };
}

export function setTab(tab) {
  return {
    type: ActionTypes.SET_TAB,
    payload: tab,
  };
}

export function preSetTab(path) {
  let tab = 0;
  if (path === '/club/sessions/new' || path === '/club') {
    tab = 1;
  } else if (/^\/club\/sessions.*/.test(path)) {
    tab = 2;
  } else if (path === '/results') {
    tab = 3;
  }
  return {
    type: ActionTypes.PRE_SET_TAB,
    payload: tab,
  };
}
