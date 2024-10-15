import { mapValues } from 'lodash';
import { format } from 'date-fns';

import { AcadYear, Semester } from 'types/modules';

import holidays from 'data/holidays.json';
import modRegData from 'data/modreg-schedule.json';
import appConfig from './app-config.json';

export const regPeriods = [
  'Select Courses',
  'Select Tutorials / Labs',
  'Add / Swap Tutorials',
  'Submit Course Requests',
  'Course Planning Exercise (CPEx)',
] as const;
export type RegPeriodType = (typeof regPeriods)[number];

export const SCHEDULE_TYPES = ['Undergraduate', 'Graduate'] as const;
export type ScheduleType = (typeof SCHEDULE_TYPES)[number];

export type RegPeriod = {
  type: RegPeriodType;
  name: string;
  start: string;
  startDate: Date;
  end: string;
  endDate: Date;
};

export type Config = {
  brandName: string;
  academicYear: AcadYear;
  semester: Semester;
  getSemesterKey: () => string;

  apiBaseUrl: string;
  elasticsearchBaseUrl: string;

  disqusShortname: string;
  venueFeedbackApi: string;
  moduleErrorApi: string;

  semesterNames: { [semester: string]: string };
  shortSemesterNames: { [semester: string]: string };

  /*
   * Toggle to show a notice for ST2 modules to refer to NUS's timetable.
   * Added because ModReg Round 0 (next AY data) overlaps with ST2 (prev AY)
   * data, and NUSMods rotates complete AYs.
   */
  showSt2ExamTimetable: boolean;
  st2ExamTimetableUrl: string;

  archiveYears: string[];
  examAvailability: Semester[];
  examAvailabilitySet: Set<Semester>;

  contact: {
    blog: string;
    email: string;
    privateEmail: string;
    facebook: string;
    githubOrg: string;
    githubRepo: string;
    messenger: string;
    twitter: string;
    telegram: string;
  };

  holidays: Date[];

  modRegSchedule: { [type in ScheduleType]: RegPeriod[] };
};

export function convertModRegDates(roundData: (typeof modRegData)[ScheduleType]): RegPeriod[] {
  return roundData.map((data) => ({
    ...data,
    type: data.type as RegPeriodType,
    start: format(new Date(data.start), 'EEEE do LLLL, h:mm aaaa'),
    end: format(new Date(data.end), 'EEEE do LLLL, h:mm aaaa'),
    startDate: new Date(data.start),
    endDate: new Date(data.end),
  }));
}

const augmentedConfig: Config = {
  ...appConfig,

  holidays: holidays.map((date) => new Date(date)),

  modRegSchedule: mapValues(modRegData, convertModRegDates),

  examAvailabilitySet: new Set(appConfig.examAvailability),

  /**
   * Returns a unique key for every acad year + semester
   */
  getSemesterKey: (): string =>
    `${augmentedConfig.academicYear} ${augmentedConfig.semesterNames[augmentedConfig.semester]}`,
};

export default augmentedConfig;
