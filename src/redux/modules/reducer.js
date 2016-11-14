import { combineReducers } from "redux";
import { reducer as reduxAsyncConnect } from "redux-async-connect";
import auth from "./auth";
import main from "./main";
import pdf from "./pdf";
import navbar from "./navbar";
import splash from "./splash";
import newSession from "./newSession";
import selectedSession from "./selectedSession";
import sessions from "./sessions";
import schemata from "./schemata";
import query from "./query";
import dialogs from "./dialogs";
import modals from "./modals";

export default combineReducers({
  reduxAsyncConnect,
  auth,
  main,
  pdf,
  splash,
  navbar,
  selectedSession,
  newSession,
  sessions,
  schemata,
  query,
  dialogs,
  modals
});
