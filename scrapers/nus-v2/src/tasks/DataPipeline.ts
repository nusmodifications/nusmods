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
import { getEffectiveSt2AcadYear, isUsingPreviousAySt2Data } from '../utils/specialTerm';

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

    const st2AcadYear = getEffectiveSt2AcadYear(this.academicYear, config.specialTermAcademicYear);
    const usePreviousAySt2 = isUsingPreviousAySt2Data(
      this.academicYear,
      config.specialTermAcademicYear,
    );

    let st2Organizations = organizations;
    let st2Modules = allModules;

    if (usePreviousAySt2) {
      this.logger.info({ st2AcadYear }, 'Using previous academic year data for Special Term II');

      st2Organizations = await new GetFacultyDepartment(st2AcadYear).run();
      st2Modules = await new GetAllModules(st2AcadYear).run({
        faculties: st2Organizations.faculties,
      });
    }

    // With module info fetched upfront, per-semester timetable and exam
    // fetches can run in parallel across semesters
    const semesterResults = await Promise.all(
      Semesters.map(async (semester) => {
        this.logger.info(`Getting data for semester ${semester}`);

        const semesterAcadYear =
          semester === 4 && usePreviousAySt2 ? st2AcadYear : this.academicYear;
        const semesterOrganizations =
          semester === 4 && usePreviousAySt2 ? st2Organizations : organizations;
        const semesterModules = semester === 4 && usePreviousAySt2 ? st2Modules : allModules;

        const getSemesterData = new GetSemesterData(semester, semesterAcadYear);
        const modules = await getSemesterData.run({
          ...semesterOrganizations,
          modules: semesterModules,
        });

        const { aliases } = await new CollateVenues(semester, semesterAcadYear).run(modules);

        if (semester === 4 && usePreviousAySt2) {
          await new CollateVenues(semester, this.academicYear).run(modules);
        }

        return { aliases, modules };
      }),
    );

    const semesterData = semesterResults.map((r) => r.modules);
    const allAliases = semesterResults.map((r) => r.aliases);

    const collateModules = new CollateModules(this.academicYear);
    const modules = await collateModules.run({
      aliases: allAliases,
      semesterData,
      preserveModuleInfoSemesters: usePreviousAySt2 ? new Set([4]) : undefined,
    });

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
