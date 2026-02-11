import { flatten } from 'lodash';

import { AcademicGrp, ModuleInfo } from '../types/api';
import { Semesters } from '../types/modules';
import { Task } from '../types/tasks';
import { Cache } from '../types/persist';

import BaseTask from './BaseTask';
import config from '../config';
import { getTermCode, retry, containsNbsps } from '../utils/api';
import { TaskError, UnknownApiError } from '../utils/errors';

interface Input {
  faculties: AcademicGrp[];
}

type Output = ModuleInfo[];

/**
 * Download module info for all faculties across the entire academic year.
 *
 * This task fetches module metadata (title, description, prerequisites, etc.)
 * once rather than per-semester, since module info does not change between
 * semesters. It first tries a year-only query (no semester filter). If the
 * API does not support that, it falls back to fetching all semesters in
 * parallel and deduplicating.
 */
export default class GetAllModules extends BaseTask implements Task<Input, Output> {
  academicYear: string;

  modulesCache: Cache<Output>;

  get name() {
    return `Get all modules info for ${this.academicYear}`;
  }

  constructor(academicYear: string = config.academicYear) {
    super(academicYear);

    this.academicYear = academicYear;
    this.modulesCache = this.getCache<Output>('all-modules');

    this.logger = this.rootLogger.child({
      task: GetAllModules.name,
      year: academicYear,
    });
  }

  async run(input: Input): Promise<Output> {
    this.logger.info(`Getting all modules for ${this.academicYear}`);

    // Try fetching without semester filter first (30 calls instead of 120)
    let modules: ModuleInfo[];
    try {
      modules = await this.fetchWithoutSemester(input);
      if (modules.length > 0) {
        this.logger.info(`Fetched ${modules.length} modules without semester filter`);
        await this.modulesCache.write(modules);
        return modules;
      }
      this.logger.warn(
        'No modules returned without semester filter, falling back to per-semester fetch',
      );
    } catch (e) {
      this.logger.warn(
        e,
        'Failed to fetch without semester filter, falling back to per-semester fetch',
      );
    }

    // Fallback: fetch for all semesters in parallel, then deduplicate
    modules = await this.fetchAllSemestersAndDeduplicate(input);
    this.logger.info(`Fetched ${modules.length} unique modules from all semesters`);

    await this.modulesCache.write(modules);
    return modules;
  }

  private async fetchWithoutSemester(input: Input): Promise<ModuleInfo[]> {
    let downloadedCount = 0;
    const totalFaculties = input.faculties.length;

    const requests = input.faculties.map(async (faculty, index) => {
      try {
        const getModules = () =>
          this.api.getFacultyModulesForYear(this.academicYear, faculty.AcademicGroup);
        const modules = await retry(getModules, 3, (error) => error instanceof UnknownApiError);

        downloadedCount += modules.length;
        this.logger.info(
          '[%d/%d] Downloaded %i modules from %s (Total: %d)',
          index + 1,
          totalFaculties,
          modules.length,
          faculty.Description,
          downloadedCount,
        );

        this.logNbspWarnings(modules);
        return modules;
      } catch (e) {
        this.logger.error(e, `Cannot get modules from ${faculty.Description}`);
        throw new TaskError(`Cannot get modules from ${faculty.Description}`, this, e);
      }
    });

    return flatten<ModuleInfo>(await Promise.all(requests));
  }

  private async fetchAllSemestersAndDeduplicate(input: Input): Promise<ModuleInfo[]> {
    const semesterResults = await Promise.all(
      Semesters.map((semester) => this.fetchForSemester(semester, input)),
    );

    // Deduplicate by module code - later semesters take priority,
    // matching the "always use latest semester's data" convention
    const moduleMap = new Map<string, ModuleInfo>();
    for (const modules of semesterResults) {
      for (const mod of modules) {
        moduleMap.set(mod.SubjectArea + mod.CatalogNumber, mod);
      }
    }

    return Array.from(moduleMap.values());
  }

  private async fetchForSemester(semester: number, input: Input): Promise<ModuleInfo[]> {
    const term = getTermCode(semester, this.academicYear);
    let downloadedCount = 0;
    const totalFaculties = input.faculties.length;

    const requests = input.faculties.map(async (faculty, index) => {
      try {
        const getModules = () => this.api.getFacultyModules(term, faculty.AcademicGroup);
        const modules = await retry(getModules, 3, (error) => error instanceof UnknownApiError);

        downloadedCount += modules.length;
        this.logger.info(
          'Semester %d [%d/%d] Downloaded %i modules from %s (Total: %d)',
          semester,
          index + 1,
          totalFaculties,
          modules.length,
          faculty.Description,
          downloadedCount,
        );

        this.logNbspWarnings(modules);
        return modules;
      } catch (e) {
        this.logger.error(
          e,
          `Cannot get modules from ${faculty.Description} for semester ${semester}`,
        );
        return [] as ModuleInfo[];
      }
    });

    return flatten<ModuleInfo>(await Promise.all(requests));
  }

  private logNbspWarnings(modules: ModuleInfo[]) {
    modules.forEach(
      (module) =>
        !!containsNbsps(module.CourseDesc) &&
        this.logger.error(
          { moduleCode: `${module.SubjectArea}${module.CatalogNumber}` },
          `${module.SubjectArea}${module.CatalogNumber}: Module description contains non-breaking spaces`,
        ),
    );
  }
}
