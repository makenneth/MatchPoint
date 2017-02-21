const DISABLE_TUTORIAL = 'mp/user/DISABLE_TUTORIAL';
const ENABLE_TUTORIAL = 'mp/user/ENABLE_TUTORIAL';
const START_TUTORIAL = 'mp/user/START_TUTORIAL';
const END_TUTORIAL = 'mp/user/END_TUTORIAL';

const initialState = {
  tutorialStart: false,
  elements: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case START_TUTORIAL:
      return {
        tutorialStart: true,
        elements: action.payload,
      };
    case END_TUTORIAL:
      return {
        tutorialStart: false,
        elements: [],
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
}

/* put this in profile */
export const enableTutorial = () => {
  localStorage.setItem('tutorial', true);
  return {
    type: ENABLE_TUTORIAL,
  };
};

export const startTutorial = (elements) => {
  return {
    type: START_TUTORIAL,
    payload: elements,
  };
};

export const endTutorial = () => {
  return {
    type: END_TUTORIAL,
  };
};
