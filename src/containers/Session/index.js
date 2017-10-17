import React from 'react';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { fetchSession, isLoaded, updateScore, updateResult } from 'redux/modules/selectedSession';
import { deleteSession, postResult } from 'redux/modules/sessions';
import EditSession from './EditSession';
import ViewSession from './ViewSession';

@asyncConnect([{
  promise: ({ store, params }) => {
    let promise;
    if (!isLoaded(store.getState(), params.id)) {
      promise = store.dispatch(fetchSession(params.id));
    }

    return promise;
  },
}])
@connect(
  ({ selectedSession: { session, sortedPlayerList, ratingChange, ratingChangeDetail, results } }) => {
    return ({ session, sortedPlayerList, ratingChange, ratingChangeDetail, results });
  },
  { deleteSession, postResult, updateScore, updateResult })
export default class RoundrobinSession extends React.PureComponent {
  render() {
    if (!this.props.session) {
      return null;
    }
    if (this.props.session.finalized) {
      return (<ViewSession
        session={this.props.session}
        sortedPlayerList={this.props.sortedPlayerList}
        ratingChangeDetail={this.props.ratingChangeDetail}
        results={this.props.results}
        ratingChange={this.props.ratingChange}
      />);
    }
    console.log(' +--', this.props.ratingChangeDetail);
    return (<EditSession
      id={this.props.params.id}
      session={this.props.session}
      deleteSession={this.props.deleteSession}
      updateScore={this.props.updateScore}
      postResult={this.props.postResult}
      updateResult={this.props.updateResult}
      sortedPlayerList={this.props.sortedPlayerList}
      ratingChange={this.props.ratingChange}
      ratingChangeDetail={this.props.ratingChangeDetail}
      results={this.props.results}
    />);
  }
}
