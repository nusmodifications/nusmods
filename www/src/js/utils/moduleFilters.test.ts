import _ from 'lodash';

import FilterGroup, { ID_DELIMITER } from 'utils/filters/FilterGroup';
import { defaultGroups, DEPARTMENT, FACULTY } from './moduleFilters';
import ModuleFilter from './filters/ModuleFilter';

describe('defaultGroups()', () => {
  const groups: FilterGroup<any>[] = _.values(
    defaultGroups({
      Science: ['Biology', 'Physics'],
      'School Of Computing': ['Computer Science'],
    }),
  );

  function expectUnique<T>(arr: T[]) {
    // Set in JS iterates over elements in insertion order, so we can use them for
    // uniqueness test
    expect(Array.from(new Set(arr))).toEqual(arr);
  }

  function testGroups(testFn: (group: FilterGroup<any>) => void) {
    // Runs a test against each group wrapped in a test block with the group's
    // label. This let us see which specific filter group is failing the test
    groups.forEach((group) => {
      test(group.label, () => testFn(group));
    });
  }

  test('groups should have unique id and label', () => {
    expectUnique(groups.map((group: FilterGroup<any>) => group.id));
    expectUnique(groups.map((group: FilterGroup<any>) => group.label));
  });

  describe('filters should have unique id', () => {
    testGroups((group) => {
      expectUnique(_.values(group.filters).map((filter) => filter.id));
      expectUnique(_.values(group.filters).map((filter) => filter.label));
    });
  });

  describe('filter ID should not contain delimiter', () => {
    testGroups((group) => {
      _.values(group.filters).forEach((filter) => {
        expect(filter.id).not.toContain(ID_DELIMITER);
      });
    });
  });

  describe('either all or none of filter ID in a group should be integer', () => {
    // Numerical keys are sorted differently when iterating over objects
    // See: http://2ality.com/2015/10/property-traversal-order-es6.html#integer-indices
    // Since we rely on object iteration order to determine the order of filters,
    // mixing key types will almost certainly produce unexpected results
    const INTEGER_REGEX = /^(0|[1-9]\d*)$/;

    testGroups((group) => {
      const keys = _.values(group.filters).map((filter) => filter.id);
      const isInteger = keys.every((key) => INTEGER_REGEX.test(key));
      const isString = keys.every((key) => !INTEGER_REGEX.test(key));

      expect(keys).not.toHaveLength(0);
      expect(isInteger || isString).toBe(true);

      if (isInteger) {
        const numeric = keys.map((key) => parseInt(key, 10));
        // Also check that numeric keys are incrementing to ensure order is correct
        numeric.slice(1).forEach((key, i) => {
          expect(numeric[i]).toBeLessThan(key);
        });
      }
    });
  });

  test('faculty filters should be created', () => {
    const facultyFilters = groups.find((group) => group.id === FACULTY);

    expect(facultyFilters).toBeTruthy();
    if (facultyFilters) {
      expect(_.size(facultyFilters.filters)).toBe(2);
    }
  });

  test('department filters should be created', () => {
    const departmentFilters = groups.find((group) => group.id === DEPARTMENT);

    expect(departmentFilters).toBeTruthy();
    if (departmentFilters) {
      expect(_.size(departmentFilters.filters)).toBe(3);
    }
  });

  test('should create search filter', () => {
    const filterGroups = defaultGroups({}, '?q=42');
    expect(filterGroups.q.filters['42']).toBeInstanceOf(ModuleFilter);
  });
});
