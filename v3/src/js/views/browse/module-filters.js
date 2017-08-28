// @flow
import type { FilterGroupId } from 'utils/filters/FilterGroup';

import LevelFilter from 'utils/filters/LevelFilter';
import TimeslotFilter from 'utils/filters/TimeslotFilter';
import Filter from 'utils/filters/ModuleFilter';
import FilterGroup from 'utils/filters/FilterGroup';
import { Timeslots } from 'types/modules';

export const LEVELS = 'level';
export const LECTURE_TIMESLOTS = 'lecture';
export const TUTORIAL_TIMESLOTS = 'tutorial';
export const MODULE_CREDITS = 'mc';

const groups: { [FilterGroupId]: FilterGroup<any> } = {
  [LEVELS]: new FilterGroup(
    LEVELS,
    'Levels',
    [1, 2, 3, 4, 5, 6].map(level => new LevelFilter(level)),
  ),

  [LECTURE_TIMESLOTS]: new FilterGroup(
    LECTURE_TIMESLOTS,
    'Lecture Time',
    Timeslots.map(([day, time]) => new TimeslotFilter(day, time, 'Lecture')),
  ),

  [TUTORIAL_TIMESLOTS]: new FilterGroup(
    TUTORIAL_TIMESLOTS,
    'Tutorial Time',
    Timeslots.map(([day, time]) => new TimeslotFilter(day, time, 'Tutorial')),
  ),

  [MODULE_CREDITS]: new FilterGroup(MODULE_CREDITS, 'Module Credit', [
    new Filter('0', '0-3 MC', module => parseFloat(module.ModuleCredit) <= 3),
    new Filter('4', '4 MC', module => module.ModuleCredit === '4'),
    new Filter('5', '5-8 MC', (module) => {
      const credits = parseFloat(module.ModuleCredit);
      return credits > 4 && credits <= 8;
    }),
    new Filter('8', 'More than 8 MC', module => parseInt(module.ModuleCredit, 10) > 8),
  ]),
};

export default groups;
