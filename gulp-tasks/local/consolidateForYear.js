import path from 'path';
import fs from 'fs-promise';
import bunyan from 'bunyan';
import R from 'ramda';
import genReqTree from './genReqTree';

/**
 * Consolidates all information and generates the
 * prerequisite/modmaven tree for one academic year.
 * By default outputs to the base path of the academic year.
 *    - modules.json
 * See genReqTree for the generation of the tree.
 */

// fields that will cause problems if differences in values arises
const DIFFERENCES_KEYS = [
  'ModuleTitle',
  'Department',
  'ModuleDescription',
  'CrossModule',
  'ModuleCredit',
  'Workload',
  'Prerequisite',
  'Preclusion',
  'Corequisite',
];

const SEMESTER_SPECIFIC_KEYS = [
  'Semester',
  'ExamDate',
  'Timetable',
  'IVLE',
  'Lecturers',
  'LecturePeriods',
  'TutorialPeriods',
];

const log = bunyan.createLogger({ name: 'consolidateForYear' });

async function consolidateForYear(config) {
  const { year } = config;
  const subLog = log.child({ year });

  const acadYear = `${year}/${year + 1}`;
  const basePath = path.join(
    config.destFolder,
    acadYear.replace('/', '-'),
  );

  const modules = {};
  await Promise.all(R.range(1, 5).map(async (semester) => {
    const pathToRead = path.join(
      basePath,
      semester.toString(),
      config.destFileName,
    );
    const listOfModules = await fs.readJson(pathToRead).catch(() => {
      subLog.info(`${pathToRead} does not exist, continuing with joining`);
      return [];
    });
    listOfModules.forEach((mod) => {
      const module = {
        ...mod,
        AcadYear: acadYear,
        Semester: semester,
      };
      const moduleCode = module.ModuleCode;
      modules[moduleCode] = modules[moduleCode] || {};
      modules[moduleCode][acadYear + semester] = module;
    });
  }));

  const joined = Object.entries(modules).map(([code, mods]) => {
    // Just log differences between sems for now. May have to take further
    // action if important data like ModuleCredit changes between sems.
    DIFFERENCES_KEYS.forEach((key) => {
      const values = R.pluck(key, Object.values(mods));
      if (new Set(values).size !== 1) {
        log.warn(`Module ${code}'s ${key} is not consistent, got: ${values}`);
      }
    });
    const modulesInAcadYear = Object.values(mods);

    const baseMod = R.last(modulesInAcadYear);
    baseMod.History = modulesInAcadYear.map(R.pick(SEMESTER_SPECIFIC_KEYS));
    return R.omit(SEMESTER_SPECIFIC_KEYS, baseMod);
  });

  const reqTree = await genReqTree(joined, config);
  const final = R.sortBy(R.prop('ModuleCode'), reqTree);

  const pathToWrite = path.join(
    basePath,
    config.destFileName,
  );
  subLog.info(`saving to ${pathToWrite}`);
  await fs.outputJson(pathToWrite, final, { spaces: config.jsonSpace });
}

export default consolidateForYear;
