import type { Persist } from '../../types/persist';
import type {
  Aliases,
  Module,
  ModuleCode,
  ModuleCondensed,
  ModuleInformation,
  RawLesson,
  Semester,
  SemesterData,
} from '../../types/modules';
import type { MPEModule } from '../../types/mpe';
import type { Venue, VenueInfo } from '../../types/venues';

import { getFileSystemWriter } from './fs';
import ElasticPersist from './elastic';

export { getCacheFactory } from './fs';
export { getFileSystemWriter };

/**
 * Call both file system and ElasticSearch persist backends
 */
export class CombinedPersist implements Persist {
  private readonly writers: Persist[] = [];

  constructor(acadYear: string) {
    this.writers.push(getFileSystemWriter(acadYear));
    this.writers.push(new ElasticPersist());
  }

  async moduleList(data: ModuleCondensed[]) {
    await Promise.all(this.writers.map((writer) => writer.moduleList(data)));
  }

  async moduleInfo(data: ModuleInformation[]) {
    await Promise.all(this.writers.map((writer) => writer.moduleInfo(data)));
  }

  async mpeModules(data: MPEModule[]) {
    await Promise.all(this.writers.map((writer) => writer.mpeModules(data)));
  }

  async moduleInformation(data: ModuleInformation[]) {
    await Promise.all(this.writers.map((writer) => writer.moduleInformation(data)));
  }

  async moduleAliases(data: Aliases) {
    await Promise.all(this.writers.map((writer) => writer.moduleAliases(data)));
  }

  async facultyDepartments(data: { [faculty: string]: string[] }) {
    await Promise.all(this.writers.map((writer) => writer.facultyDepartments(data)));
  }

  async module(moduleCode: ModuleCode, data: Module) {
    await Promise.all(this.writers.map((writer) => writer.module(moduleCode, data)));
  }

  async getModuleCodes() {
    const moduleCodes = await Promise.all(this.writers.map((writer) => writer.getModuleCodes()));
    return Array.from(new Set(moduleCodes.flat()));
  }

  async deleteModule(moduleCode: ModuleCode) {
    await Promise.all(this.writers.map((writer) => writer.deleteModule(moduleCode)));
  }

  async venueList(semester: Semester, data: Venue[]) {
    await Promise.all(this.writers.map((writer) => writer.venueList(semester, data)));
  }

  async venueInformation(semester: Semester, data: VenueInfo) {
    await Promise.all(this.writers.map((writer) => writer.venueInformation(semester, data)));
  }

  async timetable(semester: Semester, moduleCode: ModuleCode, data: RawLesson[]) {
    await Promise.all(this.writers.map((writer) => writer.timetable(semester, moduleCode, data)));
  }

  async semesterData(semester: Semester, moduleCode: ModuleCode, data: SemesterData) {
    await Promise.all(
      this.writers.map((writer) => writer.semesterData(semester, moduleCode, data)),
    );
  }
}
