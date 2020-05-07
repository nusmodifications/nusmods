import { strict as assert } from 'assert';
import { flatten, partition } from 'lodash';

import { AcademicGrp, AcademicOrg, ModuleInfo } from '../types/api';
import { Semester } from '../types/modules';
import { Task } from '../types/tasks';
import { Cache } from '../types/persist';

import BaseTask from './BaseTask';
import config from '../config';
import { getTermCode, retry, containsNbsps } from '../utils/api';
import { TaskError, UnknownApiError } from '../utils/errors';
import { validateSemester } from '../services/validation';

interface Input {
  departments: AcademicOrg[];
  faculties: AcademicGrp[];
}

type Output = ModuleInfo[];

/**
 * Download modules info for all faculties in a specific semester
 */
export default class GetSemesterModules extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  modulesCache: Cache<Output>;

  get name() {
    return `Get modules info for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    assert(validateSemester(semester), `${semester} is not a valid semester`);

    super(academicYear);

    this.semester = semester;
    this.academicYear = academicYear;

    this.modulesCache = this.getCache<Output>(`semester-${semester}-modules`);

    this.logger = this.rootLogger.child({
      semester,
      task: GetSemesterModules.name,
      year: academicYear,
    });
  }

  async run(input: Input) {
    this.logger.info(`Getting modules for ${this.academicYear} semester ${this.semester}`);

    const term = getTermCode(this.semester, this.academicYear);

    // We make a new request for each department because the API will timeout if
    // we try to request for all of them in one shot
    const requests = input.departments.map(async (department) => {
      try {
        const getModules = () =>
          this.api.getDepartmentModules(term, department.AcademicOrganisation);
        const modules = await retry(getModules, 3, (error) => error instanceof UnknownApiError);

        // Only return modules which are visible in the system
        const [printed, hidden] = partition(
          modules,
          (module: ModuleInfo) => module.PrintCatalog === 'Y',
        );

        this.logger.debug('Downloaded %i modules from %s', printed.length, department.Description);
        if (hidden.length > 0) {
          this.logger.debug('Filtered out %i non-print modules', hidden.length);
        }

        printed.forEach(
          (module) =>
            !!containsNbsps(module.Description) &&
            this.logger.error(
              `Bad data. Module description for ${module.CatalogNumber} contains non-breaking spaces`,
            ),
        );

        return printed;
      } catch (e) {
        this.logger.error(e, `Cannot get modules from ${department.Description}`);
        throw new TaskError(`Cannot get modules from ${department.Description}`, this, e);
      }
    });

    let modules: ModuleInfo[];
    try {
      modules = flatten<ModuleInfo>(await Promise.all(requests));
    } catch (e) {
      throw new TaskError('Cannot get module list', this, e);
    }

    this.logger.info(`Downloaded ${modules.length} modules in all`);

    // Cache module info to disk
    await this.modulesCache.write(modules);

    return modules;
  }
}
