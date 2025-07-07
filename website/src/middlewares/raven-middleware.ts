import { Middleware } from 'redux';
import { size } from 'lodash';
import * as Sentry from '@sentry/browser';
import { produce } from 'immer';
import { State } from 'types/state';

const stateTransformer = (state: State): Record<string, unknown> => ({
  ...state,
  moduleBank: {
    moduleList: `${state.moduleBank.moduleList.length} modules`,
    modules: `${size(state.moduleBank.modules)} modules`,
  },
  venueBank: `${state.venueBank.venueList.length} venues`,
});

// eslint-disable-next-line @typescript-eslint/ban-types
const ravenMiddleware: Middleware<{}, State> = (store) => {
  Sentry.configureScope((scope) => {
    scope.addEventProcessor((event) =>
      produce(event, (draft) => {
        draft.extra = {
          ...(draft.extra ?? {}),
          'redux:state': stateTransformer(store.getState()),
        };
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
