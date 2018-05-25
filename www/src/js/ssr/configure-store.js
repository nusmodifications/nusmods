// @flow

import { createStore, applyMiddleware, type Store } from 'redux';
import thunk from 'redux-thunk';
import rootReducer, { type State } from 'reducers/index';

export default function configureStore(defaultState?: State): Store<State, *, *> {
  const middlewares = [thunk];

  const storeEnhancer = applyMiddleware(...middlewares);

  return createStore(rootReducer, defaultState, storeEnhancer);
}
