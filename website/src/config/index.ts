import { format, parseISO } from 'date-fns';

import { AcadYear, Semester } from 'types/modules';
import { toSingaporeTime } from 'utils/timify';

import holidays from '../data/holidays.json';
import modRegData from '../data/modreg-schedule.json';
import appConfig from './app-config.json';
import { disableCPExForProd } from '../featureFlags';

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

export type CPExWindow = {
  start: string;
  startDate: Date;
  end: string;
  endDate: Date;
};

export type Config = {
  brandName: string;
  academicYear: AcadYear;
  specialTermAcademicYear: AcadYear | null;
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
   * Fallback link for ST II exam dates that are unavailable after AY migration.
   * During the overlap window we prefer merged previous-AY ST II data; this
   * link is shown only when that data has no exam date.
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
    twitter: string;
    telegram: string;
  };

  holidays: Date[];

  modRegSchedule: { [type in ScheduleType]: RegPeriod[] };

  cpexWindow: CPExWindow | null;
  isCPExEmergencyDisabled: boolean;
  isCPExAvailable: (now?: Date) => boolean;
  getNextCPExAvailabilityChange: (now: Date) => Date | null;
};

export function convertModRegDates(roundData: (typeof modRegData)[ScheduleType]): RegPeriod[] {
  return roundData.map((data: (typeof modRegData)[ScheduleType][number]) => ({
    ...data,
    type: data.type as RegPeriodType,
    start: format(new Date(data.start), 'EEEE do LLLL, h:mm aaaa'),
    end: format(new Date(data.end), 'EEEE do LLLL, h:mm aaaa'),
    startDate: new Date(data.start),
    endDate: new Date(data.end),
  }));
}

export function convertCPExWindow(
  windowData: { start: unknown; end: unknown } | null | undefined,
): CPExWindow | null {
  if (
    !windowData ||
    typeof windowData.start !== 'string' ||
    typeof windowData.end !== 'string' ||
    !windowData.start.endsWith('+08:00') ||
    !windowData.end.endsWith('+08:00')
  ) {
    return null;
  }

  const startDate = parseISO(windowData.start);
  const endDate = parseISO(windowData.end);
  if (
    !Number.isFinite(startDate.getTime()) ||
    !Number.isFinite(endDate.getTime()) ||
    startDate >= endDate
  ) {
    return null;
  }

  return {
    start: format(toSingaporeTime(startDate), 'EEEE do LLLL, h:mm aaaa'),
    startDate,
    end: format(toSingaporeTime(endDate), 'EEEE do LLLL, h:mm aaaa'),
    endDate,
  };
}

export function isCPExAvailableAt(
  now: Date,
  window: CPExWindow | null,
  isProduction: boolean,
  isEmergencyDisabled: boolean,
): boolean {
  if (!isProduction) return true;
  if (isEmergencyDisabled || !window) return false;

  const nowTime = now.getTime();
  const startTime = window.startDate.getTime();
  const endTime = window.endDate.getTime();
  return (
    Number.isFinite(nowTime) &&
    Number.isFinite(startTime) &&
    Number.isFinite(endTime) &&
    startTime <= endTime &&
    nowTime >= startTime &&
    nowTime < endTime
  );
}

export function isProductionEnvironment(
  buildEnvironment: string | undefined,
  runtimeEnvironment: string | undefined,
): boolean {
  return (buildEnvironment ?? runtimeEnvironment) === 'production';
}

export function getNextCPExAvailabilityChangeAt(
  now: Date,
  window: CPExWindow | null,
  isProduction: boolean,
  isEmergencyDisabled: boolean,
): Date | null {
  if (!isProduction || isEmergencyDisabled || !window) return null;

  const nowTime = now.getTime();
  const startTime = window.startDate.getTime();
  const endTime = window.endDate.getTime();
  if (
    !Number.isFinite(nowTime) ||
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    startTime > endTime
  ) {
    return null;
  }

  if (nowTime < startTime) return window.startDate;
  if (nowTime < endTime) return window.endDate;
  return null;
}

const cpexWindow = convertCPExWindow(modRegData.cpexWindow);
const cpexPeriod: RegPeriod | null = cpexWindow
  ? {
      type: 'Course Planning Exercise (CPEx)',
      name: '',
      start: cpexWindow.start,
      startDate: cpexWindow.startDate,
      end: cpexWindow.end,
      endDate: cpexWindow.endDate,
    }
  : null;

const modRegSchedule: Config['modRegSchedule'] = {
  Undergraduate: [
    ...convertModRegDates(modRegData.Undergraduate),
    ...(cpexPeriod ? [cpexPeriod] : []),
  ],
  Graduate: [...convertModRegDates(modRegData.Graduate), ...(cpexPeriod ? [cpexPeriod] : [])],
};

const isProduction = isProductionEnvironment(
  typeof NUSMODS_ENV === 'undefined' ? undefined : NUSMODS_ENV,
  typeof process === 'undefined' ? undefined : process.env.VERCEL_ENV,
);

const augmentedConfig: Config = {
  ...appConfig,

  holidays: holidays.map((date: string) => new Date(date)),

  modRegSchedule,

  cpexWindow,

  isCPExEmergencyDisabled: isProduction && disableCPExForProd,

  isCPExAvailable: (now: Date = new Date()): boolean =>
    isCPExAvailableAt(now, cpexWindow, isProduction, disableCPExForProd),

  getNextCPExAvailabilityChange: (now: Date): Date | null =>
    getNextCPExAvailabilityChangeAt(now, cpexWindow, isProduction, disableCPExForProd),

  examAvailabilitySet: new Set(appConfig.examAvailability),

  /**
   * Returns a unique key for every acad year + semester
   */
  getSemesterKey: (): string =>
    `${augmentedConfig.academicYear} ${augmentedConfig.semesterNames[augmentedConfig.semester]}`,
};

export default augmentedConfig;
