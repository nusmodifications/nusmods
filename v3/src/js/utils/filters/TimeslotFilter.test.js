// @flow

/** @var {Module} */
import cs1010s from '__mocks__/modules/CS1010S.json';
/** @var {Module} */
import cs3216 from '__mocks__/modules/CS3216.json';

import Combinatorics from 'js-combinatorics';
import { DaysOfWeek, TimesOfDay, Semesters } from 'types/modules';
import TimeslotFilter, { TimeslotTypes } from './TimeslotFilter';
import { testFilter } from './filter-test-helpers';

test('test should filter modules according to their lecture timeslot', () => {
  // Generate all possible combinations of parameters to test against
  const possibleArgs = Combinatorics.cartesianProduct(DaysOfWeek, TimesOfDay, TimeslotTypes, Semesters);

  testFilter(TimeslotFilter, cs1010s, possibleArgs, [
    ['Wednesday', 'Morning', 'Lecture', 1],
    ['Thursday', 'Morning', 'Tutorial', 1],
    ['Thursday', 'Afternoon', 'Tutorial', 1],
    ['Friday', 'Morning', 'Tutorial', 1],
    ['Friday', 'Afternoon', 'Tutorial', 1],
    ['Monday', 'Morning', 'Tutorial', 1],
    ['Tuesday', 'Morning', 'Tutorial', 1],
    ['Tuesday', 'Afternoon', 'Tutorial', 1],
    ['Monday', 'Afternoon', 'Tutorial', 1],
  ]);

  testFilter(TimeslotFilter, cs3216, possibleArgs, [
    ['Monday', 'Evening', 'Lecture', 1],
  ]);
});
