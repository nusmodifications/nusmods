// @flow

import Raven from 'raven-js';
import createRavenMiddleware from 'raven-for-redux';

import type { State } from 'reducers/index';
import type { ModuleBank } from 'reducers/moduleBank';

function stringifyModuleBank(moduleBank: ModuleBank): string {
  return `${moduleBank.moduleList.length} modules`;
}

export default createRavenMiddleware(Raven, {
  stateTransformer(state: State) {
    return {
      ...state,
      entities: {
        moduleBank: stringifyModuleBank(state.moduleBank),
      },
    };
  },
});
