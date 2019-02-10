import { Middleware } from 'redux';
import * as Sentry from '@sentry/browser';
import { State } from 'reducers/index';
import update from 'immutability-helper';

const stateTransformer = (state: State): any => ({
  ...state,
  moduleBank: `${state.moduleBank.moduleList.length} modules`,
  venueBank: `${state.venueBank.venueList.length} venues`,
});

const ravenMiddleware: Middleware<State, any, any> = (store) => {
  Sentry.configureScope((scope) => {
    scope.addEventProcessor((event) => {
      const state = store.getState();

      return update(event, {
        extra: {
          'redux:state': {
            $set: stateTransformer(state),
          },
        },
      });
    });
  });

  return (next) => (action) => {
    Sentry.addBreadcrumb({
      category: 'redux-action',
      message: action.type,
    });

    return next(action);
  };
};

export default ravenMiddleware;
