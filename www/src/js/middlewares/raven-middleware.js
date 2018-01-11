// @flow

import Raven from 'raven-js';
import createRavenMiddleware from 'raven-for-redux';

import type { State } from 'reducers/index';

export default createRavenMiddleware(Raven, {
  stateTransformer(state: State) {
    return {
      ...state,
      moduleBank: `${state.moduleBank.moduleList.length} modules`,
      venueBank: `${state.venueBank.venueList.length} venues`,
    };
  },
});
