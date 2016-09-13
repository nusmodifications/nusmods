import appConfig from './app-config.json';

const augmentedConfig = {
  ...appConfig,
  semTimetableFragment: (semester = appConfig.semester) => {
    // For use in the URL: E.g. `timetable/2016-2017/sem1`
    const acadYear = appConfig.academicYear.replace('/', '-');
    return `timetable/${acadYear}/sem${semester}`;
  },
};

export default augmentedConfig;
