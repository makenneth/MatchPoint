import { combineReducers } from 'redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect-react16';
import auth from './auth';
import main from './main';
import navbar from './navbar';
import splash from './splash';
import newSession from './newSession';
import selectedSession from './selectedSession';
import sessions from './sessions';
import schemata from './schemata';
import query from './query';
import reset from './reset';
import uploadReducer from './upload';
import modals from './modals';
import tutorial from './tutorial';
import players from './players';
import activePlayers from './activePlayers';
import autocomplete from './autocomplete';
import clubInformation from './clubInformation';
import clubDetail from './clubDetail';
import hour from './hour';
import { passwordChange, infoChange } from './profile';

export default combineReducers({
  reduxAsyncConnect,
  auth,
  main,
  splash,
  reset,
  navbar,
  selectedSession,
  newSession,
  sessions,
  schemata,
  query,
  uploadReducer,
  modals,
  tutorial,
  players,
  activePlayers,
  clubDetail,
  hour,
  autocomplete,
  clubInformation,
  passwordChange,
  infoChange,
});
