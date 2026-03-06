// Replace all methods on the API with mock functions
import type { INusApi } from '../nus-api';

const mockApi: INusApi = {
  getFacultyModules: vi.fn(),
  getFacultyModulesForYear: vi.fn(),
  getModuleExam: vi.fn(),

  getFaculty: vi.fn(),
  getDepartment: vi.fn(),

  getModuleTimetable: vi.fn(),
  getDepartmentTimetables: vi.fn(),
  getSemesterTimetables: vi.fn(),

  getTermExams: vi.fn(),
};

export default mockApi;
