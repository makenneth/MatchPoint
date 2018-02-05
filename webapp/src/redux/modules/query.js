import ActionTypes from 'redux/actionTypes';
import request from 'utils/request';
import { ScoreCalculation } from 'helpers';
import { setMessage } from './main';

const initialState = {
  loaded: false,
  loading: false,
  clubs: {},
  selectedClub: null,
  roundrobins: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_ROUNDROBIN_DETAIL_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case ActionTypes.FETCH_ROUNDROBIN_DETAIL_SUCCESS: {
      const { session } = action.payload;
      let roundrobin;
      if (!session.finalized) {
        const { players } = session;
        const ratingChange = {};
        for (const player of players) {
          ratingChange[player.id] = 0;
        }
        const sortedPlayerList = [];
        const results = {};
        session.selected_schema.reduce((acc, numInGroup) => {
          const playersInGroup = players.slice(acc, acc + numInGroup);
          sortedPlayerList.push(playersInGroup.map(p => ({
            id: p.id,
            wins: 0,
            losses: 0,
          })));
          playersInGroup.forEach((player, i) => {
            results[player.id] = {};
            [...playersInGroup.slice(0, i), ...playersInGroup.slice(i + 1)].forEach((other) => {
              results[player.id][other.id] = [0, 0];
            });
          });
          return acc + numInGroup;
        }, 0);

        roundrobin = {
          ...session,
          sortedPlayerList,
          results,
          ratingChange,
          ratingChangeDetail: {},
        };
      } else {
        const scoreCalculation = new ScoreCalculation(
          session.players, session.selected_schema, session.results
        );
        const sortedPlayerList = scoreCalculation.sortPlayers();
        const [ratingChangeDetail, ratingChange] = scoreCalculation.calculateScoreChange();
        roundrobin = {
          ...session,
          sortedPlayerList,
          ratingChangeDetail,
          ratingChange,
        };
      }
      return {
        ...state,
        loading: false,
        roundrobins: {
          ...state.roundrobins,
          [session.short_id]: roundrobin,
        },
      };
    }
    case ActionTypes.FETCH_ALL_CLUBS_REQUEST:
      return {
        ...state,
        loaded: false,
        loading: true,
      };

    case ActionTypes.FETCH_ALL_CLUBS_SUCCESS: {
      const clubs = {};
      const data = action.payload.clubs;

      data.forEach((club) => {
        clubs[club.id] = club;
      });
      return {
        ...state,
        loading: false,
        loaded: true,
        clubs,
      };
    }

    case ActionTypes.SET_QUERY_CLUB: {
      const selectedClub = action.payload && state.clubs[action.payload];
      return {
        ...state,
        selectedClub,
        selectedDate: null,
      };
    }
    case ActionTypes.SET_QUERY_DATE:
      return {
        ...state,
        selectedDate: action.payload.id,
      };

    case ActionTypes.FETCH_ROUNDROBIN_DETAIL_FAILURE:
    case ActionTypes.FETCH_ALL_CLUBS_FAILURE:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
};

export function setClub(id) {
  return {
    type: ActionTypes.SET_QUERY_CLUB,
    payload: id,
  };
}

export function setDate(id) {
  console.log('setdate', id);
  return {
    type: ActionTypes.SET_QUERY_DATE,
    payload: { id },
  };
}

function fetchRoundRobinDetailRequest() {
  return {
    type: ActionTypes.FETCH_ROUNDROBIN_DETAIL_REQUEST,
  };
}

function fetchRoundRobinDetailSuccess(clubId, session) {
  return {
    type: ActionTypes.FETCH_ROUNDROBIN_DETAIL_SUCCESS,
    payload: { clubId, session },
  };
}

function fetchRoundRobinDetailFailure(error) {
  return {
    type: ActionTypes.FETCH_ROUNDROBIN_DETAIL_FAILURE,
    payload: { error },
  };
}

export function fetchRoundRobinDetail(clubId, id) {
  return (dispatch) => {
    dispatch(fetchRoundRobinDetailRequest());
    return request(`/api/clubs/${clubId}/sessions/${id}`)
      .then(
        (res) => dispatch(fetchRoundRobinDetailSuccess(clubId, res.roundrobin)),
        (err) => {
          dispatch(setMessage('Cannot get the detail for this session. Please try again later.'));
          dispatch(fetchRoundRobinDetailFailure(err));
        }
      );
  };
}

function fetchAllClubsRequest() {
  return {
    type: ActionTypes.FETCH_ALL_CLUBS_REQUEST,
  };
}

function fetchAllClubsSuccess(clubs) {
  return {
    type: ActionTypes.FETCH_ALL_CLUBS_SUCCESS,
    payload: { clubs },
  };
}

function fetchAllClubsFailure(error) {
  return {
    type: ActionTypes.FETCH_ALL_CLUBS_FAILURE,
    payload: { error },
  };
}

export function fetchAllClubs() {
  return (dispatch) => {
    dispatch(fetchAllClubsRequest());
    return request('/api/clubs/all')
      .then(
        res => dispatch(fetchAllClubsSuccess(res.clubs)),
        err => dispatch(fetchAllClubsFailure(err))
      );
  };
}

export const hasLoaded = (state) => {
  return state.query.loaded;
};
