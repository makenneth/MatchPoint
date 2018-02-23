import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { asyncConnect } from 'redux-async-connect-react16';
import {
  fetchSession, isLoaded,
  updateScore, updateResult,
  determinSessionEditStatus,
} from 'redux/modules/selectedSession';
import { startEditSavedSession } from 'redux/modules/newSession';
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
  { deleteSession, postResult, updateScore, updateResult, startEditSavedSession, push }
)
export default class RoundrobinSession extends React.PureComponent {
  render() {
    const {
      session, sortedPlayerList,
      ratingChange, ratingChangeDetail,
      results, editable, isLoading,
    } = this.props.selectedSession;
    if (!session || editable === null) {
      return null;
    }

    return (<EditSession
      id={this.props.params.id}
      session={session}
      push={this.props.push}
      deleteSession={this.props.deleteSession}
      updateScore={this.props.updateScore}
      startEditSavedSession={this.props.startEditSavedSession}
      postResult={this.props.postResult}
      updateResult={this.props.updateResult}
      sortedPlayerList={sortedPlayerList}
      ratingChange={ratingChange}
      ratingChangeDetail={ratingChangeDetail}
      results={results}
      editable={editable}
      isLoading={isLoading}
    />);
  }
}
