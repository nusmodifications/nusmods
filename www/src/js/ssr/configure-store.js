// @flow

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer, { type State } from 'reducers/index';

export default function configureStore(defaultState?: State) {
  const middlewares = [thunk];

  const storeEnhancer = applyMiddleware(...middlewares);

  return createStore(rootReducer, defaultState, storeEnhancer);
}
