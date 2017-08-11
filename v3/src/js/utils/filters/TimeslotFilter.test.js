// @flow

import cs1010s from '__mocks__/modules/CS1010S.json';
import cs3216 from '__mocks__/modules/CS3216.json';

import Combinatorics from 'js-combinatorics';
import { DaysOfWeek, TimesOfDay } from 'types/modules';
import type { Semester } from 'types/modules';
import TimeslotFilter, { TimeslotTypes } from './TimeslotFilter';
import { testFilter } from './test-filter';

test('test should filter modules according to their lecture timeslot', () => {
  // Generate all possible combinations of parameters to test against
  const semesters: Array<Semester> = [1, 2, 3, 4];
  const possibleArgs = Combinatorics.cartesianProduct(DaysOfWeek, TimesOfDay, TimeslotTypes, semesters);

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
