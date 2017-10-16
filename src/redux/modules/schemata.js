import { findSchemata } from 'helpers';
import ActionTypes from 'redux/actionTypes';

const initialState = {
  selected: [],
  schemata: [[]],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.FOUND_SCHEMATA:
      return {
        ...state,
        schemata: action.payload,
        selected: [],
      };
    case ActionTypes.CHANGE_SCHEMA:
      return {
        ...state,
        selected: action.payload,
      };
    case ActionTypes.MOVE_PLAYER_UP: {
      if (action.payload === 0) {
        return state;
      }
      const selected = [...state.selected];
      selected[action.payload - 1] += 1;
      selected[action.payload] -= 1;
      return {
        ...state,
        selected,
      };
    }
    case ActionTypes.MOVE_PLAYER_DOWN: {
      if (action.payload === state.selected.length - 1) {
        return state;
      }
      const selected = [...state.selected];
      selected[action.payload + 1] += 1;
      selected[action.payload] -= 1;
      return {
        ...state,
        selected,
      };
    }
    default:
      return state;
  }
};

export const updateSchemata = (numJoined, min = 3, max = 7) => {
  const range = [];
  for (let i = max; i >= min; i--) {
    range.push(i);
  }

  return {
    type: ActionTypes.FOUND_SCHEMATA,
    payload: findSchemata(numJoined, range),
  };
};

export const changeSchema = (schema) => {
  return {
    type: ActionTypes.CHANGE_SCHEMA,
    payload: schema,
  };
};

export const movePlayerUp = (group) => {
  return {
    type: ActionTypes.MOVE_PLAYER_UP,
    payload: group,
  };
};

export const movePlayerDown = (group) => {
  return {
    type: ActionTypes.MOVE_PLAYER_DOWN,
    payload: group,
  };
};
