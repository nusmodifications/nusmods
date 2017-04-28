import path from 'path';
import fs from 'fs-extra';
import bunyan from 'bunyan';
import R from 'ramda';
import cheerio from 'cheerio';
import moment from 'moment';
import Promise from 'bluebird';
import gotCached from '../utils/gotCached';
import sortByKey from '../utils/sortByKey';

/**
 * Outputs cors data for regular sems (1 & 2) or
 * special sems (3 & 4).
 * Also outputs lesson types that are either
 * lectures or tutorials.
 * By default outputs to:
 *   - corsRaw.json
 *   - lessonTypes.json
 */

const REGULAR_SEMESTER = 'regular semester';
const SPECIAL_SEMESTER = 'special semester';

const TIMESTAMP_REGEX = /Correct as at ([^<]+)/;
const ACADEMIC_YEAR_REGEX = /\d{4}\W\d{4}/;

const DATE_FORMAT = 'DD-MM-YYYY';

const LESSON_TYPES = ['Lecture', 'Tutorial'];
const ROOT_URLS = {
  [REGULAR_SEMESTER]: 'https://myaces.nus.edu.sg/cors/jsp/report/',
  [SPECIAL_SEMESTER]: 'https://myaces.nus.edu.sg/sts/jsp/report/',
};

const MODULE_TYPES = [
  'Module',
  'GEM2015',
  'GEM',
  'SSM',
  'UEM',
  'CFM',
];

const log = bunyan.createLogger({ name: 'cors' });

function processModulePage(webpage, moduleInfo) {
  const $ = cheerio.load(webpage);
  const timestamp = $('h2').text().match(TIMESTAMP_REGEX).pop();

  // first table consist of details of the module
  const moduleDetails = $('.tableframe').first().find('tr td:nth-child(2)');
  const timetable = [];

  // get the timetable info
  const timetableTables = $('.tableframe').find('tr table');
  timetableTables.each((i, table) => {
    // remove inner header and empty rows
    const rows = $('tr', table)
      .slice(1)
      .filter((i, el) => $('td', el).length > 6);

    // get all the relevant information
    const timetableDetails = rows.map((i, el) => {
      const row = $('td', el);
      return {
        ClassNo: row.eq(0).text().trim(),
        LessonType: row.eq(1).text(),
        WeekText: row.eq(2).text().replace(/\u00a0/g, ' '),
        DayText: row.eq(3).text(),
        StartTime: row.eq(4).text(),
        EndTime: row.eq(5).text(),
        Venue: row.eq(6).text(),
      };
    }).get();

    timetable.push(...timetableDetails);
  });

  const examText = moduleDetails.eq(4).text().trim();
  if (examText !== 'No Exam Date.') {
    const date = R.head(examText.split(' '));
    const examMoment = moment(date, DATE_FORMAT, true);
    if (!examMoment.isValid()) {
      throw new Error(`Module ${moduleInfo.moduleCode}'s date format is wrong: ${date}`);
    }
  }
  return {
    Type: moduleInfo.type,
    ModuleCode: moduleInfo.moduleCode,
    Department: moduleInfo.department,
    CorrectAsAt: timestamp,
    ModuleTitle: moduleDetails.eq(1).text(),
    ModuleDescription: moduleDetails.eq(2).text(),
    ExamDate: examText,
    ModuleCredit: moduleDetails.eq(5).text(),
    Prerequisite: moduleDetails.eq(6).text(),
    Preclusion: moduleDetails.eq(7).text(),
    Workload: moduleDetails.eq(8).text(),
    Timetable: timetable,
  };
}

function processLessonTypes(webpage, lessonTypes) {
  const $ = cheerio.load(webpage);

  const timetableTables = $('.tableframe').find('tr table');
  timetableTables.each((i, table) => {
    const lessonType = LESSON_TYPES[i];
    // remove inner header and empty rows
    const rows = $('tr', table)
      .slice(1)
      .filter((i, el) => $('td', el).length > 6);

    rows.each((i, el) => {
      const key = $('td', el).eq(1).text();

      const originalVal = lessonTypes[key];
      // throw if original value is different from the new one
      if (originalVal && originalVal !== lessonType) {
        throw new Error(`lessonTypes ${key} conflict: ${originalVal} vs ${lessonType}`);
      }
      lessonTypes[key] = lessonType; // eslint-disable-line no-param-reassign
    });
  });
}

async function processListings(rootUrl, type, lessonTypes, config) {
  const url = `${rootUrl}${type}InfoListing.jsp`;
  const webpage = await gotCached(url, config);
  const $ = cheerio.load(webpage);
  const listingInfo = $('h2').text().split(':');

  const academicYear = listingInfo[1].match(ACADEMIC_YEAR_REGEX).shift();
  const semester = listingInfo[2].match(/\d/).shift();

  const listOfModuleInfo = $('tr[valign="top"]').toArray();

  async function processModuleInfo(row) {
    const hyperlink = $('div > a', row);

    const urlStr = `${rootUrl}${hyperlink.prop('href')}`;
    const page = await gotCached(urlStr, config);

    processLessonTypes(page, lessonTypes);

    const moduleInfo = {
      type,
      moduleCode: hyperlink.html().trim(),
      department: $('td div', row).last().text().trim(),
    };

    const moduleData = await processModulePage(page, moduleInfo);
    return moduleData;
  }
  const modules = await Promise.map(listOfModuleInfo, processModuleInfo,
    { concurrency: config.concurrency });
  return {
    academicYear,
    semester,
    modules,
  };
}

async function cors(config) {
  const semesterCategory = config.semester;
  const subLog = log.child({ semesterCategory });

  const lessonTypesPath = path.join(
    config.destFolder,
    config.destLessonTypes,
  );
  const lessonTypes = await fs.readJson(lessonTypesPath).catch(() => {
    subLog.warn(`Failed to read ${lessonTypesPath}, proceeding with empty object`);
    return {};
  });
  const url = ROOT_URLS[semesterCategory];
  const modulesByTypes = MODULE_TYPES.map(type => processListings(url, type, lessonTypes, config));
  const modulesByAcadYearAndSem = await Promise.all(modulesByTypes);

  function pluckSingle(property) {
    const props = R.uniq(R.pluck(property, modulesByAcadYearAndSem));
    if (props.length > 1) {
      throw new Error(`${property} should only contain single piece of data, found ${props}`);
    }
    return R.head(props);
  }
  const academicYear = pluckSingle('academicYear');
  const semester = pluckSingle('semester');
  const modules = R.chain(R.prop('modules'), modulesByAcadYearAndSem);
  subLog.info(`parsed ${modules.length} cors modules`);

  subLog.info(`saving to ${lessonTypesPath}`);
  await fs.outputJson(lessonTypesPath, sortByKey(lessonTypes), { spaces: config.jsonSpace });

  const pathToWrite = path.join(
    config.destFolder,
    academicYear.replace('/', '-'),
    semester,
    config.destFileName,
  );
  subLog.info(`saving to ${pathToWrite}`);
  await fs.outputJson(pathToWrite, modules, { spaces: config.jsonSpace });
  return modules;
}

export default cors;
export {
  REGULAR_SEMESTER,
  SPECIAL_SEMESTER,
  DATE_FORMAT,
};
