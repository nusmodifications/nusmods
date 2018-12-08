// @flow

import type { ModuleCode, ModuleCondensed } from 'types/modules';
import type { ModuleBank } from 'reducers/moduleBank';

/* eslint-disable import/prefer-default-export */
export function getModuleCondensed(
  moduleBank: ModuleBank,
): (moduleCode: ModuleCode) => ?ModuleCondensed {
  return (moduleCode) => moduleBank.moduleCodes[moduleCode];
}
