import path from 'path';
import fs from 'fs-extra';
import bunyan from 'bunyan';
import R from 'ramda';
import genReqTree from './genReqTree';
import mergeModuleFields from '../utils/mergeModuleFields';

/**
 * Consolidates all information and generates the
 * prerequisite/modmaven tree for one academic year.
 * By default outputs to the base path of the academic year.
 *    - modules.json
 * See genReqTree for the generation of the tree.
 */

const MODULE_GENERAL_KEYS = [
  'ModuleCode',
  'ModuleTitle',
  'AcadYear',
  'Department',
  'ModuleDescription',
  'ModuleCredit',
  'Workload',
  'Types',
  'CrossModule',
  'Corequisite',
  'Prerequisite',
  'ParsedPrerequisite',
  'Preclusion',
  'ParsedPreclusion',
  'ModmavenTree',
  'LockedModules',
  'CorsBiddingStats',
  'History',
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
      const code = module.ModuleCode;
      modules[code] = modules[code] || {};
      modules[code][acadYear + semester] = module;
    });
  }));

  const joined = Object.entries(modules).map(([moduleCode, mods]) => {
    const mergeModule = mergeModuleFields(subLog, moduleCode);
    const modulesInAcadYear = Object.values(mods);
    let baseMod = {};
    modulesInAcadYear.forEach((mod) => {
      baseMod = mergeModule(baseMod, R.pick(MODULE_GENERAL_KEYS, mod));
    });
    baseMod.History = modulesInAcadYear.map(R.pick(SEMESTER_SPECIFIC_KEYS));
    return baseMod;
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
