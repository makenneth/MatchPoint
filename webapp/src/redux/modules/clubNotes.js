import ActionTypes from 'redux/actionTypes';
import request from 'utils/request';
import { setMessage } from './main';

const initialState = {
  isLoading: {},
  errors: {},
};

export default function ClubNotes(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CLUB_NOTE_REQUEST:
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [action.payload.type]: true,
        },
        errors: {},
      };

    case ActionTypes.UPDATE_CLUB_NOTE_SUCCESS:
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [action.payload.type]: false,
        },
      };

    case ActionTypes.UPDATE_CLUB_NOTE_FAILURE: {
      const { type, error } = action.payload;
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [type]: false,
        },
        errors: {
          ...state.errors,
          [type]: error,
        },
      };
    }

    default:
      return state;
  }
}

function updateClubNoteRequest(type) {
  return {
    type: ActionTypes.UPDATE_CLUB_NOTE_REQUEST,
    payload: { type },
  };
}
function updateClubNoteSuccess(type, note) {
  return {
    type: ActionTypes.UPDATE_CLUB_NOTE_SUCCESS,
    payload: { type, note },
  };
}

function updateClubNoteFailure(type, error) {
  return {
    type: ActionTypes.UPDATE_CLUB_NOTE_FAILURE,
    payload: { type, error },
  };
}

export function updateClubNote(type, note) {
  return (dispatch) => {
    dispatch(updateClubNoteRequest(type));
    return request('/api/my/notes', {
      method: 'PATCH',
      body: JSON.stringify({ type, note }),
    }).then(
      (res) => {
        dispatch(updateClubNoteSuccess(type, res.note));
        dispatch(setMessage('Successfully added the note.'));
      },
      (err) => dispatch(updateClubNoteFailure(type, err))
    );
  };
}
