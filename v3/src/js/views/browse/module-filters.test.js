// @flow
import _ from 'lodash';

import FilterGroup, { ID_DELIMINATOR } from 'utils/filters/FilterGroup';
import filterGroups from './module-filters';

const groups: FilterGroup<*>[] = _.values(filterGroups);

function expectUnique<T>(arr: T[]) {
  // Set in JS iterates over elements in insertion order
  expect(Array.from(new Set(arr))).toEqual(arr);
}

test('groups should have unique id and label', () => {
  expectUnique(groups.map((group: FilterGroup<*>) => group.id));
  expectUnique(groups.map((group: FilterGroup<*>) => group.label));
});

test('filters should have unique id', () => {
  groups.forEach((group: FilterGroup<*>) => {
    expectUnique(_.values(group.filters).map(filter => filter.id));
    expectUnique(_.values(group.filters).map(filter => filter.label));
  });
});

test('filter ID should not contain deliminator', () => {
  groups.forEach((group: FilterGroup<*>) => {
    _.values(group.filters).forEach((filter) => {
      expect(filter.id).not.toContain(ID_DELIMINATOR);
    });
  });
});
