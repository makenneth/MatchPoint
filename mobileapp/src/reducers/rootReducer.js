import { combineReducers } from 'redux';
import movies from '../modules/movies/movies.reducer';
import clubs from './clubs';
import detail from './detail';

const rootReducer = combineReducers({
	movies,
  clubs,
  detail,
});

export default rootReducer;
