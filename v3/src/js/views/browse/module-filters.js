// @flow

import LevelFilter from 'utils/filters/LevelFilter';
import TimeslotFilter from 'utils/filters/TimeslotFilter';
import Filter from 'utils/filters/ModuleFilter';
import FilterGroup from 'utils/filters/FilterGroup';
import { Timeslots } from 'types/modules';

export const LEVELS = 'Level';
export const LECTURE_TIMESLOTS = 'Lecture Time';
export const TUTORIAL_TIMESLOTS = 'Tutorial Time';
export const MODULE_CREDITS = 'Module Credit';

export default {
  [LEVELS]: new FilterGroup(
    LEVELS,
    [1, 2, 3, 4, 5, 6].map(level => new LevelFilter(level)),
  ),

  [LECTURE_TIMESLOTS]: new FilterGroup(
    LECTURE_TIMESLOTS,
    Timeslots.map(([day, time]) => new TimeslotFilter(day, time, 'Lecture')),
  ),

  [TUTORIAL_TIMESLOTS]: new FilterGroup(
    TUTORIAL_TIMESLOTS,
    Timeslots.map(([day, time]) => new TimeslotFilter(day, time, 'Tutorial')),
  ),

  [MODULE_CREDITS]: new FilterGroup(MODULE_CREDITS, [
    new Filter('0-3 MC', module => parseInt(module.ModuleCredit, 10) <= 3),
    new Filter('4 MC', module => module.ModuleCredit === '4'),
    new Filter('5-8 MC', (module) => {
      const credits = parseInt(module.ModuleCredit, 10);
      return credits >= 5 && credits <= 8;
    }),
    new Filter('More than 8 MC', module => parseInt(module.ModuleCredit, 10) > 8),
  ]),
};
