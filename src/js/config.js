const config = require('json!config/config.json');

const augmentedConfig = {
  ...config,
  semTimetableFragment: (semester) => {
    // For use in the URL: E.g. `timetable/2016-2017/sem1`
    return `timetable/${config.academicYear.replace('/', '-')}/sem${semester || config.semester}`;
  },
};

export default augmentedConfig;
