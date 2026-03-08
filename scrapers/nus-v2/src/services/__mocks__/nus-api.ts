// Replace all methods on the API with mock functions
import type { INusApi } from '../nus-api';

const mockApi: INusApi = {
  getDepartment: vi.fn(),
  getDepartmentTimetables: vi.fn(),
  getFaculty: vi.fn(),

  getFacultyModules: vi.fn(),
  getFacultyModulesForYear: vi.fn(),

  getModuleExam: vi.fn(),
  getModuleTimetable: vi.fn(),
  getSemesterTimetables: vi.fn(),

  getTermExams: vi.fn(),
};

export default mockApi;
