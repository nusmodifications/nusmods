import { invert } from 'lodash';
import { WorkingDays } from 'types/modules';

export const DAYS = WorkingDays.length; // One week mon - sat
export const DAY_START_HOUR = 8; // This just needs to be earlier than the earliest lesson
export const DAY_END_HOUR = 22; // Similarly, later than the latest lesson.
export const HOURS_PER_DAY = DAY_END_HOUR - DAY_START_HOUR; // 14 8 am --> 10 pm. We save 24 - HOURS_PER_DAY variables per day.
export const HOURS_PER_WEEK = HOURS_PER_DAY * DAYS;
export const NUM_WEEKS = 13;

export const DAY_IDXS: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
};
export const IDX_DAYS = invert(DAY_IDXS);

// All possible week numbers we should encounter (except WeekRange)
export const ALL_WEEKS = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]];
