import { createStore, applyMiddleware, compose, Store } from 'redux';
import { persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import { setAutoFreeze } from 'immer';

import rootReducer from 'reducers';
import requestsMiddleware from 'middlewares/requests-middleware';
import ravenMiddleware from 'middlewares/raven-middleware';
import getLocalStorage from 'storage/localStorage';

import type { GetState } from 'types/redux';
import type { State } from 'types/state';
import type { Actions } from 'types/actions';

// For redux-devtools-extensions - see
// https://github.com/zalmoxisus/redux-devtools-extension
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// immer uses Object.freeze on returned state objects, which is incompatible with
// redux-persist. See https://github.com/rt2zz/redux-persist/issues/747
setAutoFreeze(false);

export default function configureStore(defaultState?: State) {
  // Clear legacy reduxState deprecated by https://github.com/nusmodifications/nusmods/pull/669
  // to reduce the amount of data NUSMods is using
  getLocalStorage().removeItem('reduxState');

  const middlewares = [ravenMiddleware, thunk, requestsMiddleware];

  if (NUSMODS_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require, import/no-extraneous-dependencies
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      level: 'info',
      collapsed: true,
      duration: true,
      diff: true,
      // Avoid diffing actions that insert a lot of stuff into the state to prevent console from lagging
      diffPredicate: (_getState: GetState, action: Actions) =>
        !action.type.startsWith('FETCH_MODULE_LIST') && !action.type.startsWith('persist/'),
    });
    middlewares.push(logger);
  }

  const storeEnhancer = applyMiddleware(...middlewares);

  const store: Store<State, any> = createStore(
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
