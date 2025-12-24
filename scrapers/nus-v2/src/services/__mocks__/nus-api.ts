// Replace all methods on the API with mock functions
import type { INusApi } from '../nus-api';

const mockApi: INusApi = {
  getFacultyModules: jest.fn(),
  getModuleExam: jest.fn(),

  getFaculty: jest.fn(),
  getDepartment: jest.fn(),

  getModuleTimetable: jest.fn(),
  getDepartmentTimetables: jest.fn(),
  getSemesterTimetables: jest.fn(),

  getTermExams: jest.fn(),
};

export default mockApi;
