import tutorialConstant from 'constants';

const DISABLE_TUTORIAL = 'mp/user/DISABLE_TUTORIAL';
const ENABLE_TUTORIAL = 'mp/user/ENABLE_TUTORIAL';
const START_TUTORIAL = 'mp/user/START_TUTORIAL';
const END_TUTORIAL = 'mp/user/END_TUTORIAL';

const initialState = {
  tutorialStart: false,
  data: { elements: [] },
  visited: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case START_TUTORIAL: {
      const component = action.payload;
      if (localStorage.getItem('tutorial') === 'false' || state.visited[component]) {
        return state;
      }

      return {
        tutorialStart: true,
        data: tutorialConstant[component],
        visited: {
          ...state.visited,
          [component]: true,
        },
      };
    }
    case DISABLE_TUTORIAL:
    case END_TUTORIAL:
      return {
        ...state,
        tutorialStart: false,
        data: initialState.data,
      };
    default:
      return state;
  }
};

export const disableTutorial = () => {
  localStorage.setItem('tutorial', false);
  return {
    type: DISABLE_TUTORIAL,
  };
};

export const enableTutorial = () => {
  localStorage.setItem('tutorial', true);
  return {
    type: ENABLE_TUTORIAL,
  };
};

export const isTutorialEnabled = () => {
  return localStorage.getItem('tutorial');
};

export const startTutorial = (component) => {
  return {
    type: START_TUTORIAL,
    payload: component,
  };
};

export const endTutorial = () => {
  return {
    type: END_TUTORIAL,
  };
};
