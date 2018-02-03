import ActionTypes from '../../constants/actionTypes';

const initialState = {
	details: {},
	genres: [],
	list: {},
	nowPlayingMovies: {},
	popularMovies: {},
	searchResults: {}
};

export default function (state = initialState, action) {
	switch (action.type) {

		case ActionTypes.RETRIEVE_POPULAR_MOVIES_SUCCESS:
			return {
				...state,
				popularMovies: action.popularMovies
			};

		case ActionTypes.RETRIEVE_NOWPLAYING_MOVIES_SUCCESS:
			return {
				...state,
				nowPlayingMovies: action.nowPlayingMovies
			};

		case ActionTypes.RETRIEVE_MOVIES_GENRES_SUCCESS:
			return {
				...state,
				genres: action.moviesGenres
			};

		case ActionTypes.RETRIEVE_MOVIES_LIST_SUCCESS:
			return {
				...state,
				list: action.list
			};

		case ActionTypes.RETRIEVE_MOVIE_DETAILS_SUCCESS:
			return {
				...state,
				details: action.details
			};

		case ActionTypes.RETRIEVE_MOVIES_SEARCH_RESULT_SUCCESS:
			return {
				...state,
				searchResults: action.searchResults
			};
		default:
			return state;
	}
}
