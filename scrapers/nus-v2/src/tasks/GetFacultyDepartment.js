// @flow

import BaseTask from './BaseTask';
import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { Task } from '../types/tasks';
import type { File } from '../components/fs';

type Output = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

/**
 * Downloads faculty and department codes. This is used to map to the codes that appear in
 * module information.
 */
export default class GetFacultyDepartment extends BaseTask implements Task<void, Output> {
  name = 'Get faculties and departments';

  logger = this.rootLogger.child({
    task: GetFacultyDepartment.name,
  });

  async cacheDownload<T>(name: string, download: () => Promise<T>, cache: File<T>): Promise<T> {
    try {
      // The department and faculties endpoints have high failure rates,
      // while their data changes infrequently. This makes them suitable
      // for caching
      const data = await download();
      await cache.write(data);
      return data;
    } catch (e) {
      // If the file is not available we try to load it from cache instead
      this.logger.warn(e, `Cannot load ${name} from API, attempting to read from cache`);
      return cache.read();
    }
  }

  async getDepartments() {
    return this.cacheDownload('department codes', this.api.getDepartment, this.fs.raw.departments);
  }

  async getFaculties() {
    return this.cacheDownload('faculty codes', this.api.getFaculty, this.fs.raw.faculties);
  }

  async run() {
    this.logger.info('Downloading faculty and department codes');

    // Download department and faculties in parallel
    const [departments, faculties] = await Promise.all([
      this.getDepartments(),
      this.getFaculties(),
    ]);

    // Return data for next task in pipeline
    return {
      departments,
      faculties,
    };
  }
}
