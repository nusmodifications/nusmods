// @flow
import _ from 'lodash';

import FilterGroup from 'utils/filters/FilterGroup';
import groups from './module-filters';

test('groups should have unique label', () => {
  const labels = _.values(groups).map((group: FilterGroup<*>) => group.label);
  expect(Array.from(new Set(labels))).toEqual(labels);
});

test('filters should have unique label', () => {
  _.values(groups).forEach((group: FilterGroup<*>) => {
    const labels = _.values(group.filters).map(filter => filter.label);
    expect(Array.from(new Set(labels))).toEqual(labels);
  });
});
