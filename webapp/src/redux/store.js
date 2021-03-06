import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';

import middleware from './middleware';

let createStoreWithMiddleware;

if (process.env.NODE_ENV === 'development' && process.env.DEVTOOLS) {
  const { persistState } = require('redux-devtools');
  const DevTools = require('../components/DevTools');
  createStoreWithMiddleware = compose(
    applyMiddleware(middleware),
    window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
    persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
  )(createStore);
} else if (process.env.NODE_ENV === 'development') {
  const createLogger = require('redux-logger');
  const logger = createLogger();
  createStoreWithMiddleware = applyMiddleware(
    middleware,
    logger,
    routerMiddleware(browserHistory),
  )(createStore);
} else {
  createStoreWithMiddleware = applyMiddleware(
    middleware,
    routerMiddleware(browserHistory),
  )(createStore);
}

const reducer = require('./modules/reducer');

const store = createStoreWithMiddleware(reducer);

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./modules/reducer', () => {
    store.replaceReducer(require('./modules/reducer'));
  });
}

export default store;
