import { Middleware } from 'redux';
import * as Sentry from '@sentry/browser';
import produce from 'immer';
import { State } from 'types/state';

const stateTransformer = (state: State): Record<string, unknown> => ({
  ...state,
  moduleBank: `${state.moduleBank.moduleList.length} modules`,
  venueBank: `${state.venueBank.venueList.length} venues`,
});

const ravenMiddleware: Middleware<{}, State> = (store) => {
  Sentry.configureScope((scope) => {
    scope.addEventProcessor((event) =>
      produce(event, (draft) => {
        if (!draft.extra) {
          draft.extra = {};
        }
        draft.extra['redux:state'] = stateTransformer(store.getState());
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
