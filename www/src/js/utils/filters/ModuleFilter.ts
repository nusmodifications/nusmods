import { ModuleCode, ModuleInformation } from 'types/modules';
import { intersectionCount } from 'utils/set';

export default class ModuleFilter {
  enabled = false;

  id: string;

  label: string;

  test: (module: ModuleInformation) => boolean;

  // ModuleCode of modules that this filter matches
  filteredModules?: Set<ModuleCode>;

  constructor(id: string, label: string, test: (module: ModuleInformation) => boolean) {
    this.id = id;
    this.label = label;
    this.test = test;
  }

  initCount(modules: ModuleInformation[]) {
    const filteredModules = new Set();

    modules
      .filter((module) => this.test(module))
      .forEach((module) => filteredModules.add(module.moduleCode));

    this.filteredModules = filteredModules;
  }

  /**
   * Return a count of modules that pass this module which intersect with the provided
   * set of modules
   *
   * @param {?Set<ModuleCode>} modules - if null, returns all modules that passes this filter
   * @returns {number}
   */
  count(modules: Set<ModuleCode> | null) {
    if (!this.filteredModules) {
      throw new Error(
        `count() method called before initCount() on filter ${this.label} (${this.id})`,
      );
    }

    if (!modules) return this.filteredModules.size;
    return intersectionCount(modules, this.filteredModules);
  }
}
