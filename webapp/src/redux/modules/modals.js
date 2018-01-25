import ActionTypes from 'redux/actionTypes';

const initialState = {
  newPlayerModal: false,
  editPlayerModal: {
    open: false,
    player: null,
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.OPEN_NEW_MODAL:
      return {
        ...state,
        newPlayerModal: true,
        editPlayerModal: {
          open: false,
          player: null,
        },
      };
    case ActionTypes.OPEN_EDIT_MODAL: {
      const player = action.payload.player;
      return {
        ...state,
        newPlayerModal: false,
        editPlayerModal: {
          open: true,
          player: {
            id: player.id,
            name: player.name,
            rating: player.rating,
          },
        },
      };
    }
    case ActionTypes.CLOSE_EDIT_MODAL:
      return {
        ...state,
        editPlayerModal: {
          open: false,
          player: null,
        },
      };
    case ActionTypes.CLOSE_NEW_MODAL:
      return {
        ...state,
        newPlayerModal: false,
      };
    default:
      return state;
  }
};

export function openEditModal(player) {
  return {
    type: ActionTypes.OPEN_EDIT_MODAL,
    payload: { player },
  };
}

export function openNewModal() {
  return {
    type: ActionTypes.OPEN_NEW_MODAL,
  };
}

export function closeEditModal() {
  return {
    type: ActionTypes.CLOSE_EDIT_MODAL,
  };
}

export function closeNewModal() {
  return {
    type: ActionTypes.CLOSE_NEW_MODAL,
  };
}
