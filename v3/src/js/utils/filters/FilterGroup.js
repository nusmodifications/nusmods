// @flow
import { keyBy, values } from 'lodash';
import update from 'immutability-helper';

import type { Module } from 'types/modules';

import ModuleFilter from './ModuleFilter';

export const ID_DELIMINATOR = ',';

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

  updateActiveFilters() {
    this.activeFilters = values(this.filters)
      .filter(filter => filter.enabled);
  }

  test(module: Module): boolean {
    if (!this.isActive()) return true;
    return this.activeFilters.some(filter => filter.test(module));
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
  toQueryString(): ?[string, string] {
    if (!this.activeFilters.length) return null;

    const filterIds = this.activeFilters.map(filter => filter.id);
    return [this.id, filterIds.join(ID_DELIMINATOR)];
  }

  fromQueryString(filterIds: ?string): FilterGroup<Filter> {
    if (!filterIds) return this;

    return filterIds.split(ID_DELIMINATOR)
      .reduce((group, id) => group.toggle(id, true), this);
  }

  static apply(modules: Module[], filterGroups: FilterGroup<any>[]): Module[] {
    // Only consider filter groups with at least one filter active
    const activeGroups = filterGroups.filter(group => group.isActive());
    if (!activeGroups.length) return modules;

    // Each module must pass SOME filter in EVERY filter group
    // eg. If level 1000, level 2000 and 4 MC filters are selected, the user most likely want
    // level 1000 OR level 2000 modules that ALSO have 4 MC
    return modules.filter(module => activeGroups.every(group => group.test(module)));
  }
}
