import { keyBy, values } from 'lodash';
import update from 'immutability-helper';

import { Module, ModuleCode } from 'types/modules';
import { FilterGroupId } from 'types/views';

import { intersection, union } from 'utils/set';
import ModuleFilter from './ModuleFilter';

export const ID_DELIMITER = ',';

/**
 * A filter group is a collection of module filters. A module filter is a simple function
 * that returns true or false given a module, and when applied to an array of modules,
 * returns all modules that matches the criteria. For performance, this matching is done
 * when the filters are initialized, so an array of all modules should be passed to
 * initFilters() before filteredModules() is accessed.
 *
 * If no filters are enabled, the group is considered inactive and does not affect the inputs.
 * If multiple filters within a group is enabled, the result is the union of the modules
 * matched by each individual filter. This is because filters often form a partition over the
 * set of all modules, so it makes sense to union the results.
 *
 * When multiple filter groups are active, the result is the intersection of each group's
 * results. This allows relatively complex filters to be easily composed, such as
 * "All level 4000 modules in Computing with lectures on Mondays or Tuesdays".
 *
 * Filter groups are immutable - when a filter is toggled on and off, a new filter group
 * is returned instead of mutating the original.
 *
 * Every filter group is serializable to and from query string value. This allows the page
 * URL to be updated when filters are turned on and off.
 */
export default class FilterGroup<Filter extends ModuleFilter> {
  id: FilterGroupId;
  label: string;
  filters: { [key: string]: Filter };

  // Memoized array of filters that are enabled
  activeFilters: Filter[];

  constructor(id: FilterGroupId, label: string, filters: Filter[]) {
    this.filters = keyBy(filters, (filter) => filter.id);
    this.id = id;
    this.label = label;

    this.updateActiveFilters();
  }

  initFilters(modules: Module[]) {
    values(this.filters).forEach((filter) => filter.initCount(modules));
    return this;
  }

  updateActiveFilters() {
    this.activeFilters = values(this.filters).filter((filter) => filter.enabled);
  }

  filteredModules(): Set<ModuleCode> {
    // Within each FilterGroup, we take the union of the results from all active filters
    return union(...this.activeFilters.map((filter) => filter.filteredModules));
  }

  toggle(idOrFilter: string | Filter, value: boolean | null | undefined): FilterGroup<Filter> {
    const id = idOrFilter instanceof ModuleFilter ? idOrFilter.id : idOrFilter;
    if (!this.filters[id]) return this;

    const newValue = typeof value === 'boolean' ? value : !this.filters[id].enabled;
    const updated = update(this, {
      filters: { [id]: { enabled: { $set: newValue } } },
    });
    updated.updateActiveFilters();

    return updated;
  }

  reset(): FilterGroup<Filter> {
    let group = this;
    this.activeFilters.forEach((filter) => {
      group = group.toggle(filter);
    });
    return group;
  }

  isActive(): boolean {
    return !!this.activeFilters.length;
  }

  // Query string (de)serialization - this allows the currently enabled filters to be
  // embedded directly
  toQueryString(): string {
    return this.activeFilters.map((filter) => filter.id).join(ID_DELIMITER);
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
   *   module count for a given filter
   * @returns {?Set<ModuleCode>}
   */
  static union(
    filterGroups: FilterGroup<any>[],
    exclude?: FilterGroup<any>,
  ): Set<ModuleCode> | null | undefined {
    const excludedId = exclude ? exclude.id : null;
    const modules = filterGroups.filter((group) => group.isActive() && group.id !== excludedId);

    if (modules.length === 0) return null;
    return intersection(...modules.map((group) => group.filteredModules()));
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
    return modules.filter((module) => filteredModuleCodes.has(module.ModuleCode));
  }
}
