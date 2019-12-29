import { difference } from 'lodash';

import { Task } from '../types/tasks';
import { Module, Semesters } from '../types/modules';

import config from '../config';

import BaseTask from './BaseTask';
import GetFacultyDepartment from './GetFacultyDepartment';
import GetSemesterData from './GetSemesterData';
import CollateVenues from './CollateVenues';
import CollateModules from './CollateModules';

/**
 * Run the entire data pipeline
 */
export default class DataPipeline extends BaseTask implements Task<void, Module[]> {
  academicYear: string;

  name = 'Get all data';

  constructor(academicYear: string = config.academicYear) {
    super(academicYear);

    this.academicYear = academicYear;
    this.logger = this.rootLogger.child({
      task: DataPipeline.name,
      year: academicYear,
    });
  }

  async run() {
    // Get a list of all existing modules so we can remove data for any modules
    // that the school API does not return - ie. modules that are no longer
    // active.
    const existingModules = await this.io.getModuleCodes();

    const organizations = await new GetFacultyDepartment(this.academicYear).run();

    // Get each semester's data in series. Running it in parallel provides
    // little benefit since the bottleneck is in module retrieval, which has to
    // run for each department and takes up most of the time

    /* eslint-disable no-await-in-loop */
    const semesterData = [];
    const allAliases = [];
    for (const semester of Semesters) {
      this.logger.info(`Getting data for semester ${semester}`);

      // Contains module and semester specific data
      const getSemesterData = new GetSemesterData(semester, this.academicYear);
      const modules = await getSemesterData.run(organizations);

      // Collect venue data for this semester
      const { aliases } = await new CollateVenues(semester, this.academicYear).run(modules);

      allAliases.push(aliases);
      semesterData.push(modules);
    }
    /* eslint-enable */

    const collateModules = new CollateModules(this.academicYear);
    const modules = await collateModules.run({ semesterData, aliases: allAliases });

    // Delete all modules that are no longer active
    const removedModules = difference(
      existingModules,
      modules.map((module) => module.moduleCode),
    );
    if (removedModules.length) {
      this.logger.info({ removedModules }, 'Removing no longer active modules');
      await Promise.all(removedModules.map((moduleCode) => this.io.deleteModule(moduleCode)));
    }

    return modules;
  }
}
