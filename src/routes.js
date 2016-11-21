import React from "react";
import { Route, IndexRoute } from "react-router";
import { Main, Splash, Club, NewRoundrobin, Sessions, Session, Query, Profile } from "containers";
import { Confirmation } from "components";
import { isAuthLoaded, loadAuth } from "redux/modules/auth";
import ErrorPage from "./errorPage";

export default ({ getState, dispatch }) => {
  const requireNotLoggedin = (nextState, replace, callback) => {
    const checkAuth = () => {
      const { club } = getState().auth;
      if (club._id) {
        replace("/club");
      }
      callback();
    };

    if (isAuthLoaded(getState().auth)) {
      checkAuth();
    } else {
      dispatch(loadAuth()).then(checkAuth);
    }
  };

  const requireLoggedIn = (nextState, replace, callback) => {
    const checkAuth = () => {
      const { club } = getState().auth;
      if (!club._id) {
        replace("/");
      }
      callback();
    };

    if (isAuthLoaded(getState().auth)) {
      checkAuth();
    } else {
      dispatch(loadAuth()).then(checkAuth);
    }
  };

  const requireConfirmed = (nextState, replace, callback) => {
    const { club } = getState().auth;
    if (!club.confirmed) {
      replace("/club/confirm");
    }
    callback();
  };
  const requireNotConfirmed = (nextState, replace, callback) => {
    const { club } = getState().auth;
    if (club.confirmed) {
      replace("/club");
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
            <IndexRoute component={NewRoundrobin} />
            <Route path="profile" component={Profile} />
            <Route path="sessions" component={Sessions} />
            <Route path="sessions/new" component={NewRoundrobin} />
            <Route path="sessions/:id" component={Session} />
          </Route>
          <Route onEnter={requireNotConfirmed}>
            <Route path="confirm" component={Confirmation} />
          </Route>
        </Route>
      </Route>
      <Route path="results" component={Query} />
      <Route path="reset" component={Splash} />
      <Route path="activate/*" component={Splash} />
      <Route path="*" component={ErrorPage} />
    </Route>
  );
};
