// @flow
import _ from 'lodash';
import type { Module } from 'types/modules';
import update from 'immutability-helper';
import ModuleFilter from './ModuleFilter';

export default class FilterGroup<Filter: ModuleFilter> {
  label: string;
  filters: { [string]: Filter };

  constructor(label: string, filters: Array<Filter>) {
    this.filters = _.keyBy(filters, filter => filter.label);
    this.label = label;
  }

  test(module: Module): boolean {
    return _.values(this.filters).some(filter => filter.test(module));
  }

  toggle(label: string): FilterGroup<Filter> {
    const enabled = this.filters[label].enabled;
    return update(this, {
      filters: { [label]: { enabled: { $set: !enabled } } },
    });
  }
}
