// @flow

import type { ModuleLevel } from 'types/modules';
import ModuleFilter from './ModuleFilter';

export default class LevelFilter extends ModuleFilter {
  level: ModuleLevel;

  constructor(level: ModuleLevel) {
    super(String(level), `${level}000`, (module) => {
      const match = module.ModuleCode.match(/(\d)\d+/);
      if (!match) return false;
      return parseInt(match[1], 10) === level;
    });

    this.level = level;
  }
}
