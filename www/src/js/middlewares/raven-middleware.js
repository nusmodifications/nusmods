// @flow

import Raven from 'raven-js';
import createRavenMiddleware from 'raven-for-redux';

import type { State } from 'reducers/index';
import type { ModuleBank } from 'reducers/moduleBank';
import type { VenueBank } from 'reducers/venueBank';

export default createRavenMiddleware(Raven, {
  stateTransformer(state: State) {
    return {
      ...state,
      moduleBank: (moduleBank: ModuleBank): string => `${moduleBank.moduleList.length} modules`,
      venueBank: (venueBank: VenueBank): string => `${venueBank.venueList.length} venues`,
    };
  },
});
