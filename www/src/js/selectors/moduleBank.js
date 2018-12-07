// @flow

import type { ModuleCode } from 'types/modules';
import type { ModuleBank } from 'reducers/moduleBank';

/* eslint-disable import/prefer-default-export */
export function isValidModule(moduleBank: ModuleBank): (moduleCode: ModuleCode) => boolean {
  return (moduleCode) => !!moduleBank.moduleCodes[moduleCode];
}
