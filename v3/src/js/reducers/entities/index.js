// @flow
import type { FSA } from 'redux';
/* eslint-disable no-duplicate-imports */
import type { ModuleBank } from './moduleBank';
import moduleBank from './moduleBank';

export type Entities = {
  moduleBank: ModuleBank,
};

const defaultEntities: Entities = {
  // $FlowFixMe: ModuleBank default is delegated to moduleBank module.
  moduleBank: {},
};

export default function entities(state: Entities = defaultEntities, action: FSA): Entities {
  return {
    moduleBank: moduleBank(state.moduleBank, action),
  };
}
