import { combineReducers } from 'redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect-react16';
import { routerReducer } from 'react-router-redux';
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
import ownClubDetail from './ownClubDetail';
import clubDetailSearch from './clubDetailSearch';
import clubSearch from './clubSearch';
import clubNotes from './clubNotes';
import hour from './hour';
import rangeAggregation from './rangeAggregation';
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
  ownClubDetail,
  clubDetailSearch,
  clubSearch,
  clubNotes,
  rangeAggregation,
  hour,
  autocomplete,
  clubInformation,
  passwordChange,
  infoChange,
  routing: routerReducer,
});
