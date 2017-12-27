import config from '../';

const mockConfig = {
  ...config,
  academicYear: '2017/2018',
  semester: 1,

  getSemesterKey: () => {
    return '2017/2018 Semester 1';
  },
};

export default mockConfig;
