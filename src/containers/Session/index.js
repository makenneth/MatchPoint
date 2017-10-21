import React from 'react';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import {
  fetchSession, isLoaded,
  updateScore, updateResult,
  determinSessionEditStatus,
} from 'redux/modules/selectedSession';
import { deleteSession, postResult } from 'redux/modules/sessions';
import EditSession from './EditSession';

@asyncConnect([{
  promise: ({ store: { dispatch, getState }, params }) => {
    const promises = [];

    if (!isLoaded(getState(), params.id)) {
      promises.push(dispatch(fetchSession(params.id)));
    }

    promises.push(dispatch(determinSessionEditStatus(params.id)));
    return Promise.all(promises);
  },
}])
@connect(
  ({ selectedSession }) => ({ selectedSession }),
  { deleteSession, postResult, updateScore, updateResult }
)
export default class RoundrobinSession extends React.PureComponent {
  render() {
    const {
      session, sortedPlayerList,
      ratingChange, ratingChangeDetail,
      results, editable,
    } = this.props.selectedSession;
    if (!session || editable === null) {
      return null;
    }

    return (<EditSession
      id={this.props.params.id}
      session={session}
      deleteSession={this.props.deleteSession}
      updateScore={this.props.updateScore}
      postResult={this.props.postResult}
      updateResult={this.props.updateResult}
      sortedPlayerList={sortedPlayerList}
      ratingChange={ratingChange}
      ratingChangeDetail={ratingChangeDetail}
      results={results}
      editable={editable}
    />);
  }
}
