// Replace all methods on the API with mock functions
const mockApi = {
  getFaculty: jest.fn(),
  getDepartment: jest.fn(),
  getDepartmentModules: jest.fn(),

  getModuleTimetable: jest.fn(),
  getDepartmentTimetables: jest.fn(),
  getSemesterTimetables: jest.fn(),

  getTermExams: jest.fn(),
};

export default mockApi;
