/** @var {Module} */
import cs1010s from '__mocks__/modules/CS1010S.json';
/** @var {Module} */
import cs3216 from '__mocks__/modules/CS3216.json';

import Combinatorics from 'js-combinatorics';
import { WorkingDaysOfWeek, TimesOfDay, Semesters, Timeslots } from 'types/modules';
import testFilter from 'test-utils/testFilter';
import TimeslotFilter, { TimeslotTypes } from './TimeslotFilter';

test('test() should filter modules according to their lecture timeslot', () => {
  // Generate all possible combinations of parameters to test against
  const possibleArgs = Combinatorics.cartesianProduct(
    WorkingDaysOfWeek,
    TimesOfDay,
    TimeslotTypes,
    Semesters,
  );

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

  testFilter(TimeslotFilter, cs3216, possibleArgs, [['Monday', 'Evening', 'Lecture', 1]]);
});

test('labelToId should be unique for all timeslots', () => {
  const idSet = new Set();
  Timeslots.forEach(([day, time]) => {
    const id = TimeslotFilter.labelToId(`${day} ${time}`);
    expect(idSet).not.toContain(id);
    idSet.add(id);
  });
});
