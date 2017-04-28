import path from 'path';
import fs from 'fs-extra';
import bunyan from 'bunyan';
import R from 'ramda';

/**
 * Splits semester data into different chunks.
 * By default outputs to:
 *   - moduleCodes.json
 *   - moduleList.json
 *   - timetable.json
 *   - moduleInformation.json
 *   - venueInformation.json
 * And indivually write each module's information to:
 *   - modules/XModule.json
 *   - modules/XModule/CorsBiddingStats.json
 *   - modules/XModule/ivle.json
 *   - modules/XModule/timetable.json
 *   - modules/XModule/index.json
 */

const log = bunyan.createLogger({ name: 'splitForYear' });

async function splitForYear(config) {
  const { year } = config;
  const subLog = log.child({ year });

  const acadYear = `${year}/${year + 1}`;
  const basePath = path.join(
    config.split.destFolder,
    acadYear.replace('/', '-'),
  );

  const consolidatedPath = path.join(
    config.consolidate.destFolder,
    acadYear.replace('/', '-'),
    config.consolidate.destFileName,
  );
  const modules = await fs.readJson(consolidatedPath);

  async function write(fileName, data) {
    const pathToWrite = path.join(
      basePath,
      fileName,
    );
    subLog.info(`saving to ${pathToWrite}`);
    await fs.outputJson(pathToWrite, data, { spaces: config.split.jsonSpace });
  }

  const moduleList = [];
  const moduleInformation = [];

  modules.forEach((mod) => {
    const pathToWrite = path.join(
      basePath,
      config.split.destSubfolder,
      `${mod.ModuleCode}.json`,
    );
    write(pathToWrite, mod);

    const module = R.pick([
      'ModuleCode',
      'ModuleTitle',
    ], mod);
    moduleList.push({
      ...module,
      Semesters: R.pluck('Semester', mod.History),
    });

    const info = R.pick([
      'ModuleCode',
      'ModuleTitle',
      'Department',
      'ModuleDescription',
      'CrossModule',
      'ModuleCredit',
      'Workload',
      'Prerequisite',
      'Preclusion',
      'Corequisite',
      'Types',
    ], mod);
    info.History = mod.History.map(R.omit(['Timetable', 'IVLE']));
    moduleInformation.push(info);

    const pathToWriteInformation = path.join(
      basePath,
      config.split.destSubfolder,
      mod.ModuleCode,
      'index.json',
    );
    write(pathToWriteInformation, info);
  });

  await Promise.all([
    write(config.split.destModuleList, moduleList),
    write(config.split.destModuleInformation, moduleInformation),
  ]);
}

export default splitForYear;
