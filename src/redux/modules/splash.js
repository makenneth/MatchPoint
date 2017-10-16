import ActionTypes from 'redux/actionTypes';

export default (state = { page: 0 }, action) => {
  switch (action.type) {
    case ActionTypes.OPEN_LOGIN:
      return {
        page: 1,
      };
    case ActionTypes.SET_PAGE:
      return {
        page: action.payload,
      };
    default:
      return state;
  }
}

export function setPage(page) {
  return {
    type:ActionTypes. SET_PAGE,
    payload: page,
  };
}

export function openLogin() {
  return {
    type: ActionTypes.OPEN_LOGIN,
  };
}
