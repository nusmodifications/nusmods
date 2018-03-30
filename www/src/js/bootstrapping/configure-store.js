// @flow

import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import rootReducer, { type State } from 'reducers';
import requestsMiddleware from 'middlewares/requests-middleware';
import ravenMiddleware from 'middlewares/raven-middleware';

// Typedef for Webpack-augmented global module variable.
// Docs: https://webpack.js.org/api/hot-module-replacement/
// Source: https://github.com/flowtype/flow-typed/issues/165#issuecomment-246002816
declare var module: {
  hot: {
    accept(path: string | string[], callback: () => void): void,
  },
};

// For redux-devtools-extensions - see
// https://github.com/zalmoxisus/redux-devtools-extension
/* eslint-disable no-underscore-dangle */
const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;
/* eslint-enable no-underscore-dangle */

export default function configureStore(defaultState?: State) {
  const middlewares = [ravenMiddleware, thunk, requestsMiddleware];

  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable */
    const { createLogger } = require('redux-logger');
    /* eslint-enable */
    const logger = createLogger({
      level: 'info',
      collapsed: true,
      duration: true,
      diff: true,
    });
    middlewares.push(logger);
  }

  const storeEnhancer = applyMiddleware(...middlewares);

  const store: Store<State, *, *> = createStore(
    rootReducer,
    defaultState,
    composeEnhancers(storeEnhancer),
  );

  if (module.hot) {
    // Enable webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => store.replaceReducer(rootReducer));
  }

  const persistor = persistStore(store);
  return { persistor, store };
}
