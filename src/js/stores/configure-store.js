import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from 'reducers';
import requestsMiddleware from 'middlewares/requests-middleware';

// Creates a preconfigured store for this example.
export default function configureStore(initialState) {
  const middlewares = [thunk, requestsMiddleware];
  // if (process.env.NODE_ENV == '__DEVELOPMENT__') {
  //   const createLogger = require('redux-logger');
  //   const logger = createLogger({
  //     level: 'info',
  //     collapsed: true,
  //     duration: true
  //   });
  //   middlewares.push(logger);
  // }
  return createStore(rootReducer, applyMiddleware(...middlewares));
}
