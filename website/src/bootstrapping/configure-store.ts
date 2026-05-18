import { applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { setAutoFreeze } from 'immer';

import rootReducer from 'reducers';
import requestsMiddleware from 'middlewares/requests-middleware';
import ravenMiddleware from 'middlewares/raven-middleware';
import stateSyncMiddleware from 'middlewares/state-sync-middleware';
import getLocalStorage from 'storage/localStorage';

import type { GetState } from 'types/redux';
import type { State } from 'types/state';
import type { Actions } from 'types/actions';
import { configureStore as RTKConfigureStore, StoreEnhancer } from '@reduxjs/toolkit';
import { rememberEnhancer } from 'redux-remember';
import { migrate } from 'remigrate';
import storage from 'storage';

// For redux-devtools-extensions - see
// https://github.com/zalmoxisus/redux-devtools-extension
const composeEnhancers: typeof compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// immer uses Object.freeze on returned state objects, which breaks undo history functionality
setAutoFreeze(false);

export default function configureStore(defaultState?: State, usePersistence: boolean = false) {
  // Clear legacy reduxState deprecated by https://github.com/nusmodifications/nusmods/pull/669
  // to reduce the amount of data NUSMods is using
  getLocalStorage().removeItem('reduxState');

  const middlewares = [ravenMiddleware, thunk, requestsMiddleware, stateSyncMiddleware];

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
        !action.type.startsWith('FETCH_MODULE_LIST') && !action.type.startsWith('@@REMEMBER_'),
    });
    middlewares.push(logger);
  }

  const storeEnhancer = applyMiddleware(...middlewares);

  const store = RTKConfigureStore({
    reducer: rootReducer,
    preloadedState: defaultState,
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers().concat(
        (usePersistence
          ? composeEnhancers(
              rememberEnhancer(
                storage,
                ['moduleBank', 'venueBank', 'timetables', 'theme', 'settings', 'planner'],
                {
                  migrate,
                  serialize: (state, _key) => state,
                  unserialize: (state, _key) => state,
                },
              ),
              storeEnhancer,
            )
          : storeEnhancer) as StoreEnhancer,
      ),
  });

  if (module.hot) {
    // Enable webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => store.replaceReducer(rootReducer));
  }

  return store;
}
