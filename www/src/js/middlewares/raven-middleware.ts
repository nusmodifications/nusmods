import { Middleware } from 'redux';
import * as Sentry from '@sentry/browser';
import { State } from 'reducers';
import produce from 'immer';

const stateTransformer = (state: State): Record<string, any> => ({
  ...state,
  moduleBank: `${state.moduleBank.moduleList.length} modules`,
  venueBank: `${state.venueBank.venueList.length} venues`,
});

const ravenMiddleware: Middleware<{}, State> = (store) => {
  Sentry.configureScope((scope) => {
    scope.addEventProcessor((event) =>
      produce(event, (draft) => {
        draft.extra!['redux:state'] = stateTransformer(store.getState());
      }),
    );
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
