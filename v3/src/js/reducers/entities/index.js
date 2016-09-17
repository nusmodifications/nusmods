// @flow
import type { FSA } from 'redux';
/* eslint-disable no-duplicate-imports */
import type { ModuleBank } from './moduleBank';
import moduleBank from './moduleBank';

export type Entities = {
  moduleBank: ModuleBank,
};

// $FlowFixMe: ModuleBank default is delegated to moduleBank module.
const defaultEntities: Entities = {};

export default function entities(state: Entities = defaultEntities, action: FSA): Entities {
  return {
    moduleBank: moduleBank(state.moduleBank, action),
  };
}
