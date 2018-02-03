import ActionTypes from '../constants/actionTypes';

const initialState = {
  isLoading: false,
  err: null,
  detail: null,
};

export default function Detail(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
