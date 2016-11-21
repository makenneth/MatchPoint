import { SET_MIN_AND_MAX } from "redux/modules/newSession";
import { updateSchemata } from "redux/modules/schemata";
import { stopLoad, LOAD } from "redux/modules/main";

export default ({ dispatch, getState }) => next => action => {
  if (typeof action === "function") {
    return action(dispatch, getState);
  }

  if (action.type === SET_MIN_AND_MAX) {
    const { min, max } = action.payload;
    if (min && max) {
      dispatch(updateSchemata(getState().newSession.numJoined, min, max));
    }
  }
  const { promise, types, ...rest } = action;
  if (!promise) {
    return next(action);
  }

  const [REQUEST, SUCCESS, FAILURE] = types;
  next({ ...rest, type: REQUEST });
  promise.then((payload) => {
    if (REQUEST === LOAD) {
      dispatch(stopLoad());
    }
    next({ ...rest, payload: payload.data, type: SUCCESS });
  }, (error) => {
    if (REQUEST === LOAD) {
      dispatch(stopLoad());
    }
    if (error.response) {
      next({ ...rest, payload: error.response.data, type: FAILURE });
    } else {
      console.log(error);
      next({ ...rest, payload: "Something went wrong...", type: FAILURE });
    }
  }).catch((error) => {
    if (REQUEST === LOAD) {
      dispatch(stopLoad());
    }
    if (error.response) {
      next({ ...rest, payload: error.response.data, type: FAILURE });
    } else {
      console.log(error);
      next({ ...rest, payload: "Something went wrong...", type: FAILURE });
    }
  });

  return promise;
};
