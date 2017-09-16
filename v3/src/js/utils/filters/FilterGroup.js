// @flow
import { keyBy, values } from 'lodash';
import update from 'immutability-helper';

import type { Module, ModuleCode } from 'types/modules';
import type { ReadOnlySet } from 'utils/set';

import { intersection, partitionUnion } from 'utils/set';
import ModuleFilter from './ModuleFilter';

export const ID_DELIMITER = ',';

export type FilterGroupId = string;

export default class FilterGroup<Filter: ModuleFilter> {
  id: FilterGroupId;
  label: string;
  filters: { [string]: Filter };

  // Memoized array of filters that are enabled
  activeFilters: Filter[];

  constructor(id: FilterGroupId, label: string, filters: Filter[]) {
    this.filters = keyBy(filters, filter => filter.id);
    this.id = id;
    this.label = label;

    this.updateActiveFilters();
  }

  initFilters(modules: Module[]) {
    values(this.filters).forEach(filter => filter.initCount(modules));
  }

  updateActiveFilters() {
    this.activeFilters = values(this.filters)
      .filter(filter => filter.enabled);
  }

  filteredModules(): ReadOnlySet<ModuleCode> {
    // Within each FilterGroup, modules are
    return partitionUnion(...this.activeFilters.map(filter => filter.filteredModules));
  }

  toggle(idOrFilter: string | Filter, value: ?boolean): FilterGroup<Filter> {
    const id = idOrFilter instanceof ModuleFilter ? idOrFilter.id : idOrFilter;
    if (!this.filters[id]) return this;

    const newValue = typeof value === 'boolean' ? value : !this.filters[id].enabled;
    const updated = update(this, {
      filters: { [id]: { enabled: { $set: newValue } } },
    });
    updated.updateActiveFilters();

    return updated;
  }

  isActive(): boolean {
    return !!this.activeFilters.length;
  }

  // Query string (de)serialization - this allows the currently enabled filters to be
  // embedded directly
  toQueryString(): string {
    return this.activeFilters
      .map(filter => filter.id)
      .join(ID_DELIMITER);
  }

  fromQueryString(filterIds: string = ''): FilterGroup<Filter> {
    const enabled = new Set(filterIds.split(ID_DELIMITER));
    return values(this.filters)
      .map((filter: Filter) => filter.id)
      .reduce((group, id) => group.toggle(id, enabled.has(id)), this);
  }

  /**
   * Get the ModuleCode of all modules that match the enabled filters in the provided
   * filter group. If no filters are active, returns null.
   *
   * @param {FilterGroup<any>[]} filterGroups
   * @param {FilterGroup<any>} [exclude] - exclude this FilterGroup - useful for calculating
   * @returns {?Set<ModuleCode>}
   */
  static union(filterGroups: FilterGroup<any>[], exclude?: FilterGroup<any>): ?Set<ModuleCode> {
    const excludedId = exclude ? exclude.id : null;
    const modules = filterGroups
      .filter(group => group.isActive() && group.id !== excludedId);

    if (modules.length === 0) return null;

    return intersection(...modules.map(group => group.filteredModules()));
  }

  /**
   * Apply filter groups onto an array of modules. The returned array contains modules that
   * matches the enabled filters, or all modules if no filters are active.
   *
   * @param {Module[]} modules
   * @param {FilterGroup<any>[]} filterGroups
   * @returns {Module[]}
   */
  static apply(modules: Module[], filterGroups: FilterGroup<any>[]): Module[] {
    const filteredModuleCodes = FilterGroup.union(filterGroups);
    if (!filteredModuleCodes) return modules;
    return modules.filter(module => filteredModuleCodes.has(module.ModuleCode));
  }
}
