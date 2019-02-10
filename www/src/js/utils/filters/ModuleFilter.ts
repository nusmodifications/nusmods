import { Module, ModuleCode } from 'types/modules';
import { intersectionCount } from 'utils/set';

export default class ModuleFilter {
  enabled = false;

  id: string;
  label: string;
  test: (module: Module) => boolean;

  // ModuleCode of modules that this filter matches
  filteredModules: Set<ModuleCode>;

  constructor(id: string, label: string, test: (module: Module) => boolean) {
    this.id = id;
    this.label = label;
    this.test = test;
  }

  initCount(modules: Module[]) {
    this.filteredModules = new Set();

    modules
      .filter((module) => this.test(module))
      .forEach((module) => this.filteredModules.add(module.ModuleCode));
  }

  /**
   * Return a count of modules that pass this module which intersect with the provided
   * set of modules
   *
   * @param {?Set<ModuleCode>} modules - if null, returns all modules that passes this filter
   * @returns {number}
   */
  count(modules: Set<ModuleCode> | null | undefined) {
    if (!this.filteredModules) {
      throw new Error(
        `count() method called before initCount() on filter ${this.label} (${this.id})`,
      );
    }

    if (!modules) return this.filteredModules.size;
    return intersectionCount(modules, this.filteredModules);
  }
}
