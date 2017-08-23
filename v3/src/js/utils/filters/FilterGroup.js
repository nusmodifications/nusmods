// @flow
import _ from 'lodash';
import type { Module } from 'types/modules';
import update from 'immutability-helper';
import ModuleFilter from './ModuleFilter';

export type FilterGroupLabel = string;
export default class FilterGroup<Filter: ModuleFilter> {
  label: FilterGroupLabel;
  filters: { [string]: Filter };

  // Memoized array of filters that are enabled
  activeFilters: Filter[];

  constructor(label: string, filters: Filter[]) {
    this.filters = _.keyBy(filters, filter => filter.label);
    this.label = label;

    this.updateActiveFilters();
  }

  updateActiveFilters() {
    this.activeFilters = _.values(this.filters)
      .filter(filter => filter.enabled);
  }

  test(module: Module): boolean {
    if (!this.isActive()) return true;
    return this.activeFilters.some(filter => filter.test(module));
  }

  toggle(label: string): FilterGroup<Filter> {
    const enabled = this.filters[label].enabled;

    const updated = update(this, {
      filters: { [label]: { enabled: { $set: !enabled } } },
    });
    updated.updateActiveFilters();

    return updated;
  }

  isActive(): boolean {
    return !!this.activeFilters.length;
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
