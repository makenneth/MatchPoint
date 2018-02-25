import ActionTypes from 'redux/actionTypes';
import request from 'utils/request';
import { setMessage } from './main';

const initialState = {
  isLoading: false,
  err: null,
};

export default function ClubNotes(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CLUB_NOTE_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case ActionTypes.UPDATE_CLUB_NOTE_SUCCESS:
      return {
        ...state,
        isLoading: false,
      };

    case ActionTypes.UPDATE_CLUB_NOTE_FAILURE:
      return {
        ...state,
        isLoading: false,
        err: action.payload.error,
      };

    default:
      return state;
  }
}

function updateClubNoteRequest() {
  return {
    type: ActionTypes.UPDATE_CLUB_NOTE_REQUEST,
  };
}
function updateClubNoteSuccess(note) {
  return {
    type: ActionTypes.UPDATE_CLUB_NOTE_SUCCESS,
    payload: { note },
  };
}

function updateClubNoteFailure(error) {
  return {
    type: ActionTypes.UPDATE_CLUB_NOTE_FAILURE,
    payload: { error },
  };
}

export function updateClubNote(type, note) {
  return (dispatch) => {
    dispatch(updateClubNoteRequest());
    return request('/api/my/notes', {
      method: 'POST',
      body: JSON.stringify({ type, note }),
    }).then(
      (res) => {
        dispatch(updateClubNoteSuccess(res.note));
        dispatch(setMessage('Successfully added the note.'));
      },
      (err) => dispatch(updateClubNoteFailure(err))
    );
  };
}
