import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';

const initialState = {
  dialogOpen: false,
  processing: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.START_PROCESS_DATA:
      return {
        ...state,
        processing: true,
      };
    case ActionTypes.OPEN_UPLOAD_DIALOG:
      return {
        ...state,
        dialogOpen: true,
      };
    case ActionTypes.ADD_PLAYERS_SUCCESS:
    case ActionTypes.CLOSE_UPLOAD_DIALOG:
      return {
        dialogOpen: false,
        processing: false,
      };
    case ActionTypes.END_PROCESS_DATA:
      return {
        ...state,
        processing: false,
      };
    default:
      return state;
  }
};

export function openUpload() {
  return {
    type: ActionTypes.OPEN_UPLOAD_DIALOG,
  };
}

export function closeUpload() {
  return {
    type: ActionTypes.CLOSE_UPLOAD_DIALOG,
  };
}

export function startLoading() {
  return { type: ActionTypes.START_PROCESS_DATA };
}

export function stopLoading() {
  return { type: ActionTypes.END_PROCESS_DATA };
}

function uploadRequest() {
  return {
    type: ActionTypes.ADD_PLAYERS_REQUEST,
  };
}

function uploadSuccess(players) {
  return {
    type: ActionTypes.ADD_PLAYERS_SUCCESS,
    payload: { players },
  };
}

function uploadFailure(error) {
  return {
    type: ActionTypes.ADD_PLAYERS_FAILURE,
    payload: { error },
  };
}

export function upload(data) {
  return (dispatch) => {
    dispatch(uploadRequest());
    return request('/api/upload/players', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(
      (res) => {
        dispatch(uploadSuccess(res.players));
      },
      (err) => dispatch(uploadFailure(err))
    );
  };
}
