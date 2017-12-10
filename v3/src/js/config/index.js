// @flow
import type { Semester, AcadYear } from 'types/modules';

import holidays from 'data/holidays.json';
import appConfig from './app-config.json';
import corsData from './corsSchedule1718Sem1.json';

export type CorsPeriodType = 'open' | 'closed';

export type CorsPeriod = {
  type: CorsPeriodType,
  start: string,
  startDate: Date,
  end: string,
  endDate: Date,
}

export type CorsRound = {
  round: string,
  periods: CorsPeriod[],
};

export type Config = {
  brandName: string,
  academicYear: AcadYear,
  semester: Semester,

  apiBaseUrl: string,
  corsUrl: string,
  ivleUrl: string,

  disqusShortname: string,

  semesterNames: { [Semester]: string },
  shortSemesterNames: { [Semester]: string },

  defaultPreferences: {
    theme: string,
    mode: string,
    faculty: string,
    student: string,
    account: string,
  },

  holidays: Date[],

  corsSchedule: CorsRound[],

  semTimetableFragment: (Semester) => string,
};

function convertCorsDate(roundData: Object): CorsRound {
  return {
    ...roundData,
    periods: roundData.periods.map(period => ({
      ...period,
      // Convert timestamps to date objects
      startDate: new Date(period.startTs),
      endDate: new Date(period.endTs),
    })),
  };
}

const augmentedConfig: Config = {
  ...appConfig,

  holidays: holidays.map(date => new Date(date)),

  corsSchedule: corsData.map(convertCorsDate),

  semTimetableFragment: (semester: Semester = appConfig.semester): string => {
    // For use in the URL: E.g. `timetable/2016-2017/sem1`
    const acadYear = appConfig.academicYear.replace('/', '-');
    return `timetable/${acadYear}/sem${semester}`;
  },
};

export default augmentedConfig;
