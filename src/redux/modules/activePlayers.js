// // import axios from 'axios';

// const FETCH_ACTIVE_PLAYERS_LOADING = 'mp/players/FETCH_ACTIVE_PLAYERS_LOADING';
// const FETCH_ACTIVE_PLAYERS_SUCCESS = 'mp/players/FETCH_ACTIVE_PLAYERS_SUCCESS';
// const FETCH_ACTIVE_PLAYERS_FAILURE = 'mp/players/FETCH_ACTIVE_PLAYERS_FAILURE';

// export default function activePlayers(state = { players: [], err: null }, action) {
//   switch (action.type) {
//     case FETCH_ACTIVE_PLAYERS_FAILURE:
//       return {
//         ...state,
//         err: action.err.error_description,
//       };

//     case FETCH_ACTIVE_PLAYERS_SUCCESS:
//       return {
//         ...state,
//         players: action.payload.players,
//       };

//     default:
//       return state;
//   }
// }

// export const fetchActivePlayers = () => {
//   return {
//     types: [
//       FETCH_ACTIVE_PLAYERS_LOADING,
//       FETCH_ACTIVE_PLAYERS_SUCCESS,
//       FETCH_ACTIVE_PLAYERS_FAILURE,
//     ],
//     promise: axios.get('/api/my/players/active'),
//   };
// };
