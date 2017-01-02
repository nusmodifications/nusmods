import path from 'path';
import querystring from 'querystring';
import fs from 'fs-promise';
import bunyan from 'bunyan';
import R from 'ramda';
import Promise from 'bluebird';
import gotCached from '../utils/gotCached';

/**
 * Deprecated: ivle api seems to have not worked last year.
 *
 * Outputs ivle data for one semester.
 * Fetches all modules individually, thus requiring
 * module codes from all other data sources.
 *
 * Changes `CourseCode` field to `ModuleCode`
 * to be consistent with all other data sources.
 * By default outputs to:
 *   - ivleRaw.json
 * Requires ivle token and key.
 */

const log = bunyan.createLogger({ name: 'ivle' });

async function ivle(config) {
  const { year, semester } = config;
  const subLog = log.child({ year, semester });
  const thisConfig = config.ivle;

  const basePath = path.join(
    thisConfig.srcFolder,
    `${year}-${year + 1}`,
    `${semester}`,
  );
  const bulletinModulesPath = path.join(
    basePath,
    config.bulletinModules.destFileName,
  );
  const corsPath = path.join(
    basePath,
    config.cors.destFileName,
  );
  const examTimetablePath = path.join(
    basePath,
    config.examTimetable.destFileName,
  );
  const moduleTimetableDeltaPath = path.join(
    basePath,
    config.moduleTimetableDelta.destFileName,
  );

  // Get module codes from all preceding tasks
  let moduleCodes = [];
  async function populateModuleCodes(jsonPath, keyOrFunc) {
    try {
      const data = await fs.readJson(jsonPath);
      let mods = [];
      if (typeof keyOrFunc === 'string') {
        mods = R.pluck(keyOrFunc, data);
      } else {
        mods = R.chain(keyOrFunc, data);
      }
      moduleCodes.push(...mods);
    } catch (error) {
      log.debug(`${jsonPath} file not present, continuing with parsing.`);
    }
  }

  await populateModuleCodes(bulletinModulesPath, 'ModuleCode');
  await populateModuleCodes(corsPath, mod => mod.ModuleCode.split(' / '));
  await populateModuleCodes(examTimetablePath, 'ModuleCode');
  await populateModuleCodes(moduleTimetableDeltaPath, 'ModuleCode');

  moduleCodes = R.uniq(moduleCodes);
  subLog.info(`found ${moduleCodes.length} modules`);

  async function processModule(moduleCode) {
    const query = querystring.stringify({
      APIKey: thisConfig.ivleApi.key,
      AcadYear: `${year}/${year + 1}`,
      IncludeAllInfo: true,
      ModuleCode: moduleCode,
      Semester: `Semester ${semester}`,
      AuthToken: thisConfig.ivleApi.token,
    });
    const url = `${thisConfig.ivleApi.baseUrl}Modules_Search?${query}`;

    let results = [];
    try {
      const fileData = await gotCached(url, thisConfig);
      results = JSON.parse(fileData).Results;
    } catch (err) {
      log.error(moduleCode);
    }

    const modules = [];
    results.forEach((result) => {
      if (result.CourseCode === moduleCode) {
        const module = R.omit(['CourseCode'], result);
        module.ModuleCode = moduleCode;
        modules.push(module);
      }
    });
    return modules;
  }
  const ivleModules = await Promise.map(moduleCodes, processModule,
    { concurrency: thisConfig.concurrency });
  subLog.info(`parsed ${ivleModules.length} bidding stats`);

  const pathToWrite = path.join(
    thisConfig.destFolder,
    `${year}-${year + 1}`,
    `${semester}`,
    thisConfig.destFileName,
  );
  subLog.info(`saving to ${pathToWrite}`);
  await fs.outputJson(pathToWrite, ivleModules, { spaces: thisConfig.jsonSpace });
}

export default ivle;
