import { createStore, applyMiddleware, compose, Store } from 'redux';
import { persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
// @ts-ignore We're replacing immutability-helper anyway
import update, { extend } from 'immutability-helper';
import rootReducer from 'reducers';
import requestsMiddleware from 'middlewares/requests-middleware';
import ravenMiddleware from 'middlewares/raven-middleware';
import { setAutoFreeze } from 'immer';

import { FSA, GetState } from 'types/redux';
import { State } from '../types/state';

// Extend immutability-helper with autovivification commands. This allows immutability-helper
// to automatically create objects if it doesn't exist before
// See: https://github.com/kolodny/immutability-helper#autovivification
// @ts-ignore
extend('$auto', (value, object) => (object ? update(object, value) : update({}, value)));

// For redux-devtools-extensions - see
// https://github.com/zalmoxisus/redux-devtools-extension
// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// immer uses Object.freeze on returned state objects, which is incompatible with
// redux-persist. See https://github.com/rt2zz/redux-persist/issues/747
setAutoFreeze(false);

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
      diffPredicate: (getState: GetState, action: FSA) =>
        !action.type.startsWith('FETCH_MODULE_LIST') && !action.type.startsWith('persist/'),
    });
    middlewares.push(logger);
  }

  const storeEnhancer = applyMiddleware(...middlewares);

  const store: Store<State, any> = createStore(
    rootReducer,
    // @ts-ignore TODO: Figure out why undefined isn't accepted
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
