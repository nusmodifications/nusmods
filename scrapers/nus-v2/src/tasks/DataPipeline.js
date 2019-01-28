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

    /* eslint-disable no-await-in-loop */
    // Run each semester in series
    const semesterModules = [];
    for (const semester of Semesters) {
      const getSemesterData = new GetSemesterData(semester, this.academicYear);
      const modules = await getSemesterData.run(organizations);
      await new CollateVenues(semester, this.academicYear).run(modules);
      semesterModules.push(modules);
    }
    /* eslint-enable */

    const collateModules = new CollateModules(this.academicYear);
    const modules = await collateModules.run(semesterModules);

    return modules;
  }
}
