import 'babel-polyfill';
import 'isomorphic-fetch';
import 'assets/resets.scss';
import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { ReduxAsyncConnect } from 'redux-async-connect';
import store from './redux/store';
import startWebsocket from './redux/socketMiddleware';
import getRoutes from './routes';

if (process.env.NODE_ENV !== 'production') {
  window.React = React;
}

document.addEventListener('DOMContentLoaded', () => {
  injectTapEventPlugin();
  // startWebsocket(store);
  if (process.env.DEVTOOLS && !window.devToolsExtension) {
    const DevTools = require('./components/DevTools');
    render(<Provider store={store}>
      <div>
        <Router
          history={browserHistory}
          render={props => <ReduxAsyncConnect {...props} />}
        >
          {getRoutes(store)}
        </Router>
        <DevTools />
      </div>
    </Provider>, document.getElementById('root'));
  } else {
    render(<Provider store={store}>
      <Router
        history={browserHistory}
        render={props => <ReduxAsyncConnect {...props} />}
      >
        {getRoutes(store)}
      </Router>
    </Provider>, document.getElementById('root'));
  }
});
