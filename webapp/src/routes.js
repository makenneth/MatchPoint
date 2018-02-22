import React from 'react';
import { Route, IndexRoute } from 'react-router';
import {
  Main, Splash, Club,
  NewRoundrobin, Sessions,
  Session, Query, Profile,
  PDFGenerator, InformationForm, ClubInfo,
} from 'containers';
import { Confirmation, Loading } from 'components';
import { isAuthLoaded, loadAuth } from 'redux/modules/auth';
import ErrorPage from './errorPage';

export default ({ getState, dispatch }) => {
  const requireNotLoggedin = (nextState, replace, callback) => {
    const checkAuth = () => {
      const { user } = getState().auth;
      if (user.id) {
        replace('/club');
      }
      callback();
    };

    if (getState().auth.loaded) {
      checkAuth();
    } else if (!getState().auth.loading) {
      dispatch(loadAuth()).then(checkAuth);
    }
  };

  const requireLoggedIn = (nextState, replace, callback) => {
    const checkAuth = () => {
      const { user } = getState().auth;
      if (!user.id) {
        replace('/');
      }
      callback();
    };

    if (getState().auth.loaded) {
      checkAuth();
    } else if (!getState().auth.loading) {
      dispatch(loadAuth()).then(checkAuth);
    }
  };

  const requireConfirmed = (nextState, replace, callback) => {
    const { user } = getState().auth;
    if (!user.verified) {
      replace('/club/confirm');
    }

    callback();
  };

  const requireNotConfirmed = (nextState, replace, callback) => {
    const { user } = getState().auth;
    if (user.verified) {
      replace('/club');
    }

    callback();
  };
  const requiredInit = (nextState, replace, callback) => {
    const { user } = getState().auth;
    if (!user.clubName) {
      replace('/club/info');
    }
    callback();
  };
  const requiredNotInit = (nextState, replace, callback) => {
    const { user } = getState().auth;
    if (user.clubName) {
      replace('/club/sessions/new');
    }
    callback();
  };

  return (
    <Route path="/" component={Main}>
      <Route onEnter={requireNotLoggedin}>
        <IndexRoute component={Splash} />
      </Route>

      <Route onEnter={requireLoggedIn}>
        <Route path="club" component={Club}>
          <Route onEnter={requireConfirmed}>
            <Route onEnter={requiredInit}>
              <IndexRoute component={NewRoundrobin} />
              <Route path="profile" component={Profile} />
              <Route path="sessions" component={Sessions} />
              <Route path="sessions/new" component={NewRoundrobin} />
              <Route path="sessions/:id" component={Session} />
              <Route path="pdf" component={PDFGenerator} />
            </Route>
            <Route onEnter={requiredNotInit}>
              <Route path="info" component={InformationForm} />
            </Route>
          </Route>
          <Route onEnter={requireNotConfirmed}>
            <Route path="confirm" component={Confirmation} />
          </Route>
        </Route>
      </Route>
      <Route path="clubs/:id" component={ClubInfo} />
      <Route path="results" component={Query} />
      <Route path="reset" component={Splash} />
      <Route path="activate/*" component={Splash} />
      <Route path="loading" component={Loading} />
      <Route path="*" component={ErrorPage} />
    </Route>
  );
};
