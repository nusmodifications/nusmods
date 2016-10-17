// @flow
import type { Semester } from 'types/modules';

import appConfig from './app-config.json';

const augmentedConfig: Object = {
  ...appConfig,
  semTimetableFragment: (semester: Semester = appConfig.semester): string => {
    // For use in the URL: E.g. `timetable/2016-2017/sem1`
    const acadYear = appConfig.academicYear.replace('/', '-');
    return `timetable/${acadYear}/sem${semester}`;
  },
};

export default augmentedConfig;
