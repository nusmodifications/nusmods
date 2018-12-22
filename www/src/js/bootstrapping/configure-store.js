// @flow
import { createStore, applyMiddleware, compose, type Store } from 'redux';
import { persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import update from 'immutability-helper';
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

// Extend immutability-helper with autovivification commands. This allows immutability-helper
// to automatically create objects if it doesn't exist before
// See: https://github.com/kolodny/immutability-helper#autovivification
update.extend('$auto', (value, object) => (object ? update(object, value) : update({}, value)));

// For redux-devtools-extensions - see
// https://github.com/zalmoxisus/redux-devtools-extension
// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

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
      // Avoid diffing actions that insert a lot of stuff into the state to prevent console from lagging
      diffPredicate: (getState, action) =>
        !action.type.startsWith('FETCH_MODULE_LIST') && !action.type.startsWith('persist/'),
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
