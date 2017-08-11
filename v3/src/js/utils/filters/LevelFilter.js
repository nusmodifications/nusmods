// @flow

import type { ModuleLevel } from 'types/modules';
import ModuleFilter from './ModuleFilter';

export default class LevelFilter extends ModuleFilter {
  level: ModuleLevel;

  constructor(level: ModuleLevel) {
    super(`${level}000`, (module) => {
      const match = module.ModuleCode.match(/(\d+)/);
      if (!match) return false;
      return match[1][0] === String(level);
    });

    this.level = level;
  }
}
