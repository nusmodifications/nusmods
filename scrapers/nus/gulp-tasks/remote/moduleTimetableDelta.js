import path from 'path';
import fs from 'fs-extra';
import bunyan from 'bunyan';
import R from 'ramda';
import moment from 'moment';
import querystring from 'querystring';
import gotCached from '../utils/gotCached';

/**
 * Outputs module timetable delta data for one semester.
 * Module timetable delta are all lesson changes made
 * since the LastModified field.
 * By default outputs to:
 *   - moduleTimetableDeltaRaw.json
 */

const log = bunyan.createLogger({ name: 'moduleTimetableDelta' });

async function moduleTimetableDelta(config) {
  let moduleTimetableDeltas = [];
  let secondsSinceLastModified = 365 * 24 * 60 * 60; // retrieve changes at most a year back

  const destPath = path.join(config.destFolder, config.destFileName);
  try {
    moduleTimetableDeltas = await fs.readJson(destPath);
    const moduleLastModified = parseInt(R.last(moduleTimetableDeltas).LastModified.substr(6), 10);
    secondsSinceLastModified = Math.floor((Date.now() - moduleLastModified) / 1000) - 1;
  } catch (error) {
    log.warn(`Failed to read ${destPath}, proceeding with empty array`);
  }
  const readableAgo = moment.duration(secondsSinceLastModified, 'seconds').humanize();
  log.info(`retrieving changes to modules since ${readableAgo} ago.`);

  const query = querystring.stringify({
    APIKey: config.ivleApi.key,
    LastModified: secondsSinceLastModified,
  });
  const url = `${config.ivleApi.baseUrl}Delta_ModuleTimeTable?${query}`;
  const delta = await gotCached(url, config);
  const deltasSinceLastModified = JSON.parse(delta);

  // If it encounters an exception, IVLE API does not seem to indicate
  // an error via HTTP status codes but still returns data,
  // with a stack trace as the value for ModuleCode and
  // default values for the rest of the fields.
  const isException = R.whereEq({ LastModified: '/Date(-62135596800000)/' });
  const elementsWithException = R.filter(isException, deltasSinceLastModified);
  if (elementsWithException.length) {
    throw new Error(`Encounted exceptions with IVLE API: ${elementsWithException}`);
  }
  moduleTimetableDeltas = moduleTimetableDeltas.concat(deltasSinceLastModified);
  log.info(`parsed ${moduleTimetableDeltas.length} module timetable delta`);

  function write(pathToWrite, data) {
    log.info(`saving to ${pathToWrite}`);
    return fs.outputJson(pathToWrite, data, { spaces: config.jsonSpace });
  }

  write(destPath, moduleTimetableDeltas);

  const groupByAcadYear = R.groupBy(R.prop('AcadYear'));
  const groupBySemester = R.groupBy(R.prop('Semester'));
  const toWrite = [];
  Object.entries(groupByAcadYear(moduleTimetableDeltas)).forEach(([academicYear, deltaForAY]) => {
    Object.entries(groupBySemester(deltaForAY)).forEach(([semester, deltaForSem]) => {
      const pathToWrite = path.join(
        config.destFolder,
        academicYear.replace('/', '-'),
        semester,
        config.destFileName,
      );
      toWrite.push(write(pathToWrite, deltaForSem));
    });
  });
  await Promise.all(toWrite);
}

export default moduleTimetableDelta;
