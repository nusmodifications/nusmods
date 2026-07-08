import { flatten } from 'lodash';

import { AcademicGrp, ModuleInfo } from '../types/api';
import { Semesters } from '../types/modules';
import { Task } from '../types/tasks';
import { Cache } from '../types/persist';

import BaseTask from './BaseTask';
import config from '../config';
import { getTermCode, retry, containsNbsps } from '../utils/api';
import { TaskError, UnknownApiError } from '../utils/errors';
import { Logger } from '../services/logger';

interface Input {
  faculties: Array<AcademicGrp>;
}

type Output = Array<ModuleInfo>;

/**
 * Compare two records of the same module code by catalog version.
 *
 * The API returns one record per catalog revision, so a single module code can
 * appear multiple times (e.g. a legacy version under a placeholder academic
 * group alongside the current one). VersionMajor.VersionMinor is monotonic -
 * higher means a more recent revision - so we pick the highest version, falling
 * back to the latest EffectiveDate when versions tie (observed only when the
 * same revision is duplicated across academic groups on the same date).
 *
 * Returns a positive number when `a` is newer than `b`, negative when older,
 * and zero when they cannot be distinguished.
 */
export function compareModuleVersion(a: ModuleInfo, b: ModuleInfo): number {
  if ((a.VersionMajor ?? 0) !== (b.VersionMajor ?? 0)) {
    return (a.VersionMajor ?? 0) - (b.VersionMajor ?? 0);
  }
  if ((a.VersionMinor ?? 0) !== (b.VersionMinor ?? 0)) {
    return (a.VersionMinor ?? 0) - (b.VersionMinor ?? 0);
  }
  // Tie-break on EffectiveDate. The format ("YYYY-MM-DD ...") sorts correctly
  // lexicographically; treat a missing date as oldest.
  const dateA = a.EffectiveDate ?? '';
  const dateB = b.EffectiveDate ?? '';
  if (dateA !== dateB) {
    return dateA < dateB ? -1 : 1;
  }
  return 0;
}

/**
 * Deduplicate module info by module code, keeping the newest catalog revision
 * (see compareModuleVersion). This must run before the data is keyed by module
 * code downstream (GetSemesterData), which would otherwise resolve duplicates
 * by array order and could select a stale revision.
 */
export function deduplicateModulesByVersion(
  modules: Array<ModuleInfo>,
  logger?: Logger,
): Array<ModuleInfo> {
  const byCode = new Map<string, ModuleInfo>();
  for (const mod of modules) {
    const moduleCode = mod.SubjectArea + mod.CatalogNumber;
    const existing = byCode.get(moduleCode);
    // Replace on a newer-or-equal revision. On an exact tie (same version and
    // effective date) this keeps the later record in iteration order: in the
    // per-semester fallback that is the later semester, preserving the "latest
    // semester's data is canonical" convention that CollateModules relies on.
    if (!existing || compareModuleVersion(mod, existing) >= 0) {
      byCode.set(moduleCode, mod);
    }
  }

  const dropped = modules.length - byCode.size;
  if (dropped > 0) {
    logger?.info(`Dropped ${dropped} stale duplicate module revision(s)`);
  }

  return Array.from(byCode.values());
}

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
    let modules: Array<ModuleInfo>;
    try {
      modules = await this.fetchWithoutSemester(input);
      if (modules.length > 0) {
        this.logger.info(`Fetched ${modules.length} modules without semester filter`);
        const deduplicated = deduplicateModulesByVersion(modules, this.logger);
        await this.modulesCache.write(deduplicated);
        return deduplicated;
      }
      this.logger.warn(
        'No modules returned without semester filter, falling back to per-semester fetch',
      );
    } catch (error) {
      this.logger.warn(
        error,
        'Failed to fetch without semester filter, falling back to per-semester fetch',
      );
    }

    // Fallback: fetch for all semesters in parallel, then deduplicate
    modules = await this.fetchAllSemesters(input);
    const deduplicated = deduplicateModulesByVersion(modules, this.logger);
    this.logger.info(`Fetched ${deduplicated.length} unique modules from all semesters`);

    await this.modulesCache.write(deduplicated);
    return deduplicated;
  }

  private async fetchWithoutSemester(input: Input): Promise<Array<ModuleInfo>> {
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
      } catch (error) {
        this.logger.error(error, `Cannot get modules from ${faculty.Description}`);
        throw new TaskError(`Cannot get modules from ${faculty.Description}`, this, error);
      }
    });

    return flatten<ModuleInfo>(await Promise.all(requests));
  }

  private async fetchAllSemesters(input: Input): Promise<Array<ModuleInfo>> {
    const semesterResults = await Promise.all(
      Semesters.map((semester) => this.fetchForSemester(semester, input)),
    );

    // Duplicates across semesters (and across catalog revisions) are resolved
    // by deduplicateModulesByVersion in run(), so just flatten here.
    return flatten<ModuleInfo>(semesterResults);
  }

  private async fetchForSemester(semester: number, input: Input): Promise<Array<ModuleInfo>> {
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
      } catch (error) {
        this.logger.error(
          error,
          `Cannot get modules from ${faculty.Description} for semester ${semester}`,
        );
        return [] as Array<ModuleInfo>;
      }
    });

    return flatten<ModuleInfo>(await Promise.all(requests));
  }

  private logNbspWarnings(modules: Array<ModuleInfo>) {
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
