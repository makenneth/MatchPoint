import request from 'utils/request';
import { ScoreCalculation } from 'helpers';
import ActionTypes from 'redux/actionTypes';
// import { LOAD, MESSAGE } from 'redux/modules/main';
import { DELETE_SESSION_SUCCESS } from 'redux/modules/sessions';

const initialState = {
  loading: false,
  loaded: false,
  session: null,
  sortedPlayerList: [],
  ratingChange: {},
  ratingChangeDetail: {},
  results: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case DELETE_SESSION_SUCCESS:
      return initialState;
    case ActionTypes.UPDATE_SCORE: {
      const { idx, ratingChangeDetail, ratingChange, results } = action.payload;
      const playerRecords = Object.keys(results).map((playerId) => {
        const versusRecords = results[playerId];
        const record = {
          id: playerId,
          wins: 0,
          losses: 0,
        };
        Object.keys(versusRecords).forEach((otherPlayer) => {
          const [wins, losses] = versusRecords[otherPlayer];
          record.wins += wins;
          record.losses += losses;
        });

        return record;
      });

      const sortedPlayerList = playerRecords.sort((p1, p2) => {
        if (p1.wins > p2.wins) {
          return -1;
        } else if (p1.wins < p2.wins) {
          return 1;
        } else if (p1.losses < p2.losses) {
          return -1;
        }
        const [player1GameWon, player2GameWon] = state.results[p1.id][p2.id];
        return player1GameWon - player2GameWon;
      });

      return {
        ...state,
        results: Object.assign({}, state.results, results),
        sortedPlayerList: [
          ...state.sortedPlayerList.slice(0, idx),
          sortedPlayerList,
          ...state.sortedPlayerList.slice(idx + 1),
        ],
        ratingChangeDetail: Object.assign({}, state.ratingChangeDetail, ratingChangeDetail),
        ratingChange: Object.assign({}, state.ratingChange, ratingChange),
      };
    }
    case ActionTypes.FETCH_SESSION_SUCCESS:
    case ActionTypes.SELECT_SESSION: {
      const { session } = action.payload;
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
        return {
          ...state,
          loaded: true,
          loading: false,
          sortedPlayerList,
          session,
          results,
          ratingChange,
        };
      }
      const scoreCalculation = new ScoreCalculation(
        session.players, session.selected_schema, session.results
      );
      const sortedPlayerList = scoreCalculation.sortPlayers();
      console.log(sortedPlayerList);
      const [ratingChangeDetail, ratingChange] = scoreCalculation.calculateScoreChange();
      return {
        ...state,
        loaded: true,
        loading: false,
        session,
        ratingChange,
        sortedPlayerList,
        results: session.results,
        ratingChangeDetail,
      };
    }

    case ActionTypes.UPDATE_RESULT:
      return {
        ...state,
        results: Object.assign({}, state.results, action.payload.results),
      };

    default:
      return state;
  }
};

export const isLoaded = (state, id) => {
  if (!state.selectedSession.loaded) {
    return false;
  }

  if (!state.selectedSession.session.id !== id) {
    return false;
  }

  return true;
};

export function setSession(session) {
  return {
    type: ActionTypes.SELECT_SESSION,
    payload: session,
  };
}

export function fetchSessionRequest() {
  return {
    type: ActionTypes.FETCH_SESSION_REQUEST,
  };
}
export function fetchSessionSuccess(session) {
  return {
    type: ActionTypes.FETCH_SESSION_SUCCESS,
    payload: { session },
  };
}

export function fetchSessionFailure(error) {
  return {
    type: ActionTypes.FETCH_SESSION_FAILURE,
    payload: { error },
  };
}

export function fetchSession(id) {
  return (dispatch) => {
    dispatch(fetchSessionRequest());
    return request(`/api/my/sessions/${id}`)
      .then(
        res => dispatch(fetchSessionSuccess(res.roundrobin)),
        err => dispatch(fetchSessionFailure(err)),
      );
  };
}

export function updateScore(ratingChangeDetail, ratingChange, results, idx) {
  return {
    type: ActionTypes.UPDATE_SCORE,
    payload: {
      ratingChangeDetail,
      ratingChange,
      results,
      idx,
    },
  };
}

export function updateResult(results) {
  return {
    type: ActionTypes.UPDATE_RESULT,
    payload: { results },
  };
}
