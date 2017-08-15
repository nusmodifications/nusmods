// @flow

import _ from 'lodash';
import LevelFilter from 'utils/filters/LevelFilter';
import TimeslotFilter from 'utils/filters/TimeslotFilter';
import Filter from 'utils/filters/ModuleFilter';
import FilterGroup from 'utils/filters/FilterGroup';
import { DaysOfWeek, TimesOfDay } from 'types/modules';
import type { Day, Time } from 'types/modules';

const timeslots: Array<[Day, Time]> = _.flatMap(DaysOfWeek, (day): Array<[Day, Time]> => {
  return TimesOfDay.map(time => [day, time]);
});

export const levels = new FilterGroup(
  'Level',
  [1, 2, 3, 4, 5, 6].map(level => new LevelFilter(level)),
);

export const lectureTimeslots = new FilterGroup(
  'Lecture Time',
  timeslots.map(([day, time]) => new TimeslotFilter(day, time, 'Lecture')),
);

export const tutorialTimeslots = new FilterGroup(
  'Tutorial Time',
  timeslots.map(([day, time]) => new TimeslotFilter(day, time, 'Tutorial')),
);

export const moduleCredits = new FilterGroup('Module Credit', [
  new Filter('0-3 MC', module => parseInt(module.ModuleCredit, 10) <= 3),
  new Filter('4 MC', module => module.ModuleCredit === '4'),
  new Filter('5-8 MC', (module) => {
    const credits = parseInt(module.ModuleCredit, 10);
    return credits >= 5 && credits <= 8;
  }),
  new Filter('More than 8 MC', module => parseInt(module.ModuleCredit, 10) > 8),
]);
