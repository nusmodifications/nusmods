import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from 'reducers';
import requestsMiddleware from 'middlewares/requests-middleware';
import ravenMiddleware from 'middlewares/raven-middleware';

// Creates a preconfigured store for this example.
export default function configureStore(defaultState) {
  const middlewares = [thunk, requestsMiddleware, ravenMiddleware];

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

  const store = createStore(rootReducer, defaultState, applyMiddleware(...middlewares));

  if (module.hot) {
    // Enable webpack hot module replacement for reducers
    module.hot.accept(
      '../reducers',
      () => store.replaceReducer(rootReducer),
    );
  }

  return store;
}
