// import axios from 'axios';

// const LOAD = 'mp/rr/LOAD';
// const FETCH_RR_SUCCESS = 'mp/rr/FETCH_RR_SUCCESS';
// const FETCH_RR_FAIL = 'mp/rr/FETCH_RR_FAIL';

// const initialState = {
//   roundrobins: {},
//   error: null,
// };

// export default (state = initialState, action) => {
//   switch (action.type) {
//     case FETCH_RR_SUCCESS: {
//       const roundrobins = Object.assign({}, state.roundrobins);
//       roundrobins[action.payload.clubId] = action.payload;
//       return {
//         ...state,
//         roundrobins,
//       };
//     }
//     case FETCH_RR_FAIL:
//       return {
//         ...state,
//         error: action.payload,
//       };
//     default:
//       return state;
//   }
// };


// export const fetchClubRoundrobins = (clubId) => {
//   return {
//     types: [LOAD, FETCH_RR_SUCCESS, FETCH_RR_FAIL],
//     promise: axios.get(`/api/clubs/${clubId}/roundrobins`),
//   };
// };
