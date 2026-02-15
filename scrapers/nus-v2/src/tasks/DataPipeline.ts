import { difference } from 'lodash';

import { Task } from '../types/tasks';
import { Module, Semesters } from '../types/modules';

import config from '../config';

import BaseTask from './BaseTask';
import GetFacultyDepartment from './GetFacultyDepartment';
import GetAllModules from './GetAllModules';
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

    // Fetch module info once for the entire year rather than per-semester,
    // since module metadata (title, description, prerequisites, etc.) does
    // not change between semesters
    const allModules = await new GetAllModules(this.academicYear).run({
      faculties: organizations.faculties,
    });

    // With module info fetched upfront, per-semester timetable and exam
    // fetches can run in parallel across semesters
    const semesterResults = await Promise.all(
      Semesters.map(async (semester) => {
        this.logger.info(`Getting data for semester ${semester}`);

        const getSemesterData = new GetSemesterData(semester, this.academicYear);
        const modules = await getSemesterData.run({
          ...organizations,
          modules: allModules,
        });

        const { aliases } = await new CollateVenues(semester, this.academicYear).run(modules);

        return { modules, aliases };
      }),
    );

    const semesterData = semesterResults.map((r) => r.modules);
    const allAliases = semesterResults.map((r) => r.aliases);

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
