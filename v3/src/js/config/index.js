// @flow
import type { Semester, AcadYear } from 'types/modules';

import appConfig from './app-config.json';

type Config = {
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

  semTimetableFragment: (Semester) => string,
};

const augmentedConfig: Config = {
  ...appConfig,
  semTimetableFragment: (semester: Semester = appConfig.semester): string => {
    // For use in the URL: E.g. `timetable/2016-2017/sem1`
    const acadYear = appConfig.academicYear.replace('/', '-');
    return `timetable/${acadYear}/sem${semester}`;
  },
};

export default augmentedConfig;
