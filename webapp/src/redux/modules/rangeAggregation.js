import request from 'utils/request';
import ActionTypes from 'redux/actionTypes';
import moment from 'moment';

const initialState = {
  isLoading: false,
  isLoaded: false,
  record: {},
  err: null,
};

export default function RangeAggregation(state = initialState, action) {
  switch (action.type) {

    case ActionTypes.FETCH_RANGE_AGGREATION_RESULT_REQUEST:
      return {
        ...state,
        isLoading: true,
        isLoaded: false,
      };

    case ActionTypes.FETCH_RANGE_AGGREATION_RESULT_SUCCESS: {
      // we can to allow user to hover over and see all the rating change with date
      //
      const { record } = action.payload;
      const players = [];
      const defaultPlayer = {
        id: null,
        name: null,
        startRating: 0,
        totalRatingChange: 0,
        totalGameWon: 0,
        totalMatchWon: 0,
        ratingChangeHistory: [],
      };
      let currentPlayer = null;
      for (const row of record) {
        if (currentPlayer && row.id !== currentPlayer.id) {
          players.push(currentPlayer);
          currentPlayer = null;
        }

        if (!currentPlayer) {
          currentPlayer = {
            ...defaultPlayer,
            id: row.id,
            name: row.name,
            rating: row.oldRating,
            ratingChangeHistory: [],
          };
        }

        currentPlayer.totalRatingChange += row.ratingChange;
        currentPlayer.totalGameWon += row.gameWon || 0;
        currentPlayer.totalMatchWon += row.matchWon || 0;
        let description;
        let type;
        if (row.result) {
          type = 'swapVert';
          description = 'Modified to';
        } else if (row.ratingChange > 0) {
          type = 'trendingUp';
          description = 'Increased by';
        } else {
          type = row.ratingChange === 0 ? 'trendingFlat' : 'trendingDown';
          description = row.ratingChange === 0 ? 'Remained Unchanged' : 'Decreased By';
        }
        currentPlayer.ratingChangeHistory.push({ date: row.date, type, description });
      }
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        record,
        playerDetail: players,
      };
    }

    case ActionTypes.FETCH_RANGE_AGGREATION_RESULT_FAILURE:
      return {
        ...state,
        isLoading: false,
        err: action.payload.error,
      };

    default:
      return state;
  }
}

function fetchRangeAggreationResultRequest() {
  return {
    type: ActionTypes.FETCH_RANGE_AGGREATION_RESULT_REQUEST,
  };
}

function fetchRangeAggreationResultSuccess(record) {
  return {
    type: ActionTypes.FETCH_RANGE_AGGREATION_RESULT_SUCCESS,
    payload: { record },
  };
}

function fetchRangeAggreationResultFailure(error) {
  return {
    type: ActionTypes.FETCH_RANGE_AGGREATION_RESULT_FAILURE,
    payload: { error },
  };
}

export function fetchRangeAggreationResult(id, startDate, endDate) {
  return (dispatch) => {
    dispatch(fetchRangeAggreationResultRequest());
    return request(`/api/query/${id}/range`, {
      query: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
      },
    })
      .then(
        res => {
          dispatch(fetchRangeAggreationResultSuccess(res.record));
        },
        err => {
          dispatch(fetchRangeAggreationResultFailure(err));
        },
      );
  };
}
