import path from 'path';
import querystring from 'querystring';
import R from 'ramda';
import fs from 'fs-extra';
import bunyan from 'bunyan';
import gotCached from '../utils/gotCached';
import titleize from '../utils/titleize';
import sortByKey from '../utils/sortByKey';

/**
 * Outputs bulletin modules without changing any of the data,
 * and also outputs departments under each faculty.
 * By default outputs to:
 *   - bulletinModulesRaw.json
 *   - facultyDepartments.json
 */

const log = bunyan.createLogger({ name: 'bulletinModules' });

async function parseBulletinModules(config) {
  const rootUrl = config.ivleApi.baseUrl;
  const query = querystring.stringify({
    APIKey: config.ivleApi.key,
    Semester: config.semester,
    TitleOnly: false,
  });
  const url = `${rootUrl}Bulletin_Module_Search?${query}`;

  const fileData = await gotCached(url, config);
  const modules = JSON.parse(fileData).Results;
  const data = R.groupBy(R.prop('AcadYear'), modules);
  return data;
}

function parseFacultyDepartment(modules) {
  const facultyDepartments = {};
  modules.forEach((module) => {
    const faculty = titleize(module.Faculty);
    const department = titleize(module.Department);
    facultyDepartments[faculty] = facultyDepartments[faculty] || [];
    facultyDepartments[faculty].push(department);
  });
  const withoutDuplicateDepartments = R.map(R.uniq, facultyDepartments);
  return sortByKey(withoutDuplicateDepartments);
}

async function bulletinModules(config) {
  const bulletinData = await parseBulletinModules(config);
  const semester = config.semester;

  const toWrite = [];
  Object.entries(bulletinData).forEach(([academicYear, modules]) => {
    const subLog = log.child({ academicYear, semester });
    const facultyDepartment = parseFacultyDepartment(modules);
    subLog.info(`parsed ${modules.length} bulletin modules`);

    async function write(fileName, data) {
      const pathToWrite = path.join(
        config.destFolder,
        academicYear.replace('/', '-'),
        `${semester}`,
        fileName,
      );
      subLog.info(`saving to ${pathToWrite}`);
      await fs.outputJson(pathToWrite, data, { spaces: config.jsonSpace });
    }
    toWrite.push(write(config.destFileName, modules));
    toWrite.push(write(config.destFacultyDepartments, facultyDepartment));
  });
  await Promise.all(toWrite);
}

export default bulletinModules;
