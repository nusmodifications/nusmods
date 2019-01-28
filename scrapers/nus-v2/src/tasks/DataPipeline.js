// @flow

import type { Task } from '../types/tasks';
import type { Module } from '../types/modules';
import BaseTask from './BaseTask';
import config from '../config';
import GetFacultyDepartment from './GetFacultyDepartment';
import { Semesters } from '../types/modules';
import GetSemesterData from './GetSemesterData';
import CollateVenues from './CollateVenues';
import CollateModules from './CollateModules';

/**
 * Run the entire data pipeline
 */
export default class DataPipeline extends BaseTask implements Task<void, Module[]> {
  academicYear: string;

  logger = this.rootLogger.child({
    task: DataPipeline.name,
    year: this.academicYear,
  });

  name = 'Get all data';

  constructor(academicYear: string = config.academicYear) {
    super();

    this.academicYear = academicYear;
  }

  async run() {
    const organizations = await new GetFacultyDepartment().run();

    // Get each semester's data in series
    /* eslint-disable no-await-in-loop */
    const semesterModules = [];
    for (const semester of Semesters) {
      this.logger.info(`Getting data for semester ${semester}`);

      // Contains module and semester specific data
      const getSemesterData = new GetSemesterData(semester, this.academicYear);
      const modules = await getSemesterData.run(organizations);

      // Collect venue data for this semester
      await new CollateVenues(semester, this.academicYear).run(modules);

      semesterModules.push(modules);
    }
    /* eslint-enable */

    const collateModules = new CollateModules(this.academicYear);
    const modules = await collateModules.run(semesterModules);

    return modules;
  }
}
