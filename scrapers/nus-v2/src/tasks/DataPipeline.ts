import { difference } from 'lodash';

import { Task } from '../types/tasks';
import { Module, Semesters } from '../types/modules';

import config from '../config';

import BaseTask from './BaseTask';
import GetFacultyDepartment from './GetFacultyDepartment';
import GetAllModules from './GetAllModules';
import GetSemesterData from './GetSemesterData';
import GetSemesterTimetable from './GetSemesterTimetable';
import CollateVenues from './CollateVenues';
import CollateModules from './CollateModules';

/**
 * Run the entire data pipeline
 */
export default class DataPipeline extends BaseTask implements Task<void, Array<Module>> {
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

    // Fetch timetables for all semesters upfront so we can determine which
    // modules have timetable data in any semester. This prevents false
    // timetable propagation to modules that are offered in other semesters
    // (e.g. GESS1000T offered in ST1 should not get Sem 2 timetable from GES1002).
    const allTimetables = await Promise.all(
      Semesters.map((semester) => new GetSemesterTimetable(semester, this.academicYear).run()),
    );

    const modulesWithAnyTimetable = new Set<string>();
    for (const timetables of allTimetables) {
      for (const moduleCode of Object.keys(timetables)) {
        modulesWithAnyTimetable.add(moduleCode);
      }
    }

    // With module info and timetables fetched upfront, per-semester exam
    // fetches can run in parallel across semesters
    const semesterResults = await Promise.all(
      Semesters.map(async (semester, index) => {
        this.logger.info(`Getting data for semester ${semester}`);

        const getSemesterData = new GetSemesterData(semester, this.academicYear);
        const modules = await getSemesterData.run({
          ...organizations,
          modules: allModules,
          modulesWithAnyTimetable,
          timetables: allTimetables[index],
        });

        const { aliases } = await new CollateVenues(semester, this.academicYear).run(modules);

        return { aliases, modules };
      }),
    );

    const semesterData = semesterResults.map((r) => r.modules);
    const allAliases = semesterResults.map((r) => r.aliases);

    const collateModules = new CollateModules(this.academicYear);
    const modules = await collateModules.run({ aliases: allAliases, semesterData });

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
