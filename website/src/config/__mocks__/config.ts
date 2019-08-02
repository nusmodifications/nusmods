import config from '..';

export { convertModRegDates } from '..';

const mockConfig = {
  ...config,
  academicYear: '2017/2018',
  semester: 1,

  timetableAvailable: [1],
  archiveYear: ['2015/2016', '2016/2017'],

  getSemesterKey: () => '2017/2018 Semester 1',
};

export default mockConfig;
