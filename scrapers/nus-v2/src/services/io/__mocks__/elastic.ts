import { Persist } from '../../../types/persist';

export default class MockedElasticPersist implements Persist {
  moduleList = () => Promise.resolve();

  moduleInfo = () => Promise.resolve();

  moduleInformation = () => Promise.resolve();

  moduleAliases = () => Promise.resolve();

  facultyDepartments = () => Promise.resolve();

  module = () => Promise.resolve();

  getModuleCodes = () => Promise.resolve([]);

  deleteModule = () => Promise.resolve();

  venueList = () => Promise.resolve();

  venueInformation = () => Promise.resolve();

  timetable = () => Promise.resolve();

  semesterData = () => Promise.resolve();
}
