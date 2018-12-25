import path from 'path';
import fs from 'fs-extra';
import moment from 'moment';
import R from 'ramda';
import bunyan from 'bunyan';
import gotCached from '../utils/gotCached';
import { getPagesTextFromPdf } from '../utils/pdf';

/**
 * Outputs exam data for one semester.
 * File type is a pdf so parsing is done entirely
 * with regex.
 * By default outputs to:
 *   - examTimetableRaw.json
 */

const DATE_FORMAT = 'D/M/YYYY';

// matches dd/mm/yyyy or d/m/yy or d/m/yy
const DATE_REGEX = /\d{1,2}\W\d{1,2}\W[20]{0,2}\d{2}/;
// matches Mon or mon or any 3 letter words
const DAY_REGEX = /\(\w{3}\)/;
// matches 0900AM, 900PM or 9:00 PM
const TIME_REGEX = /[0-2]?[1-9]\W?[0-5]\d\s?(?:AM|PM)?/;
// matches 2 or 3 capital alphabets mixed with whitespace
// followed by 4 numerics and 1 or 2 letters
const CODE_REGEX = /[A-Z|\W]{2,4}[0-9]{4}(?:[A-Z]|[A-Z]R)?/;
// matches multiple words in all caps with symbols and roman numerals I, V
const TITLE_REGEX = /[^a-z]+[IV]*/;
// matches rest of any non digit word(s)
const FACULTY_REGEX = /[^\d]+/;

// combined to give us this using capture groups and delimiter allowances
const MODULE_REGEX = new RegExp(
  [
    '(',
    DATE_REGEX.source,
    ')\\s?(?:',
    DAY_REGEX.source,
    ')?\\s*(',
    TIME_REGEX.source,
    ')\\s*(',
    CODE_REGEX.source,
    ')\\s*(',
    TITLE_REGEX.source,
    ')\\b(',
    FACULTY_REGEX.source,
    ')$',
  ].join(''),
);

const log = bunyan.createLogger({ name: 'examTimetable' });

function parseModule(module, subLog) {
  const moduleArr = R.pipe(
    R.match(MODULE_REGEX),
    R.map(R.replace(/\s/g, ' ')), // normalize whitespace
  )(module);

  if (!moduleArr.length) {
    subLog.warn(`'${module}' is not a valid module`);
    return {};
  }

  const date = moduleArr[1].replace(/\W/g, '/'); // replace delimiters to '/'
  const time = moduleArr[2].replace(' ', ''); // remove whitespace
  const code = moduleArr[3];
  const title = moduleArr[4].trim();
  const faculty = moduleArr[5];

  if (!moment(date, DATE_FORMAT, true).isValid()) {
    throw new Error(`Module ${code}'s date format is wrong: ${date}`);
  }

  return {
    Date: date,
    Time: time,
    Faculty: faculty,
    ModuleCode: code,
    Title: title,
  };
}

async function parseExamPdf(fileData, subLog) {
  function removeHeadersAndPageNum(pages) {
    return pages.map((page, index) => {
      const startOfData = R.findIndex(R.test(DATE_REGEX), page);
      const endOfData = R.findLastIndex(R.test(/[A-Za-z]+/), page) + 1;

      if (startOfData === -1 || endOfData === -1) {
        // eslint-disable-next-line max-len
        subLog.warn(
          `page ${index + 1} of pdf has no data, please visually check if this is correct`,
        );
        return [];
      }
      return page.slice(startOfData, endOfData);
    });
  }

  function modulesFromText(strings) {
    const modules = [];
    strings.forEach((str) => {
      if (DATE_REGEX.test(str)) {
        // create new module
        modules.push(str);
      } else {
        modules[modules.length - 1] += str;
      }
    });
    return modules;
  }

  const modulesArrFromPages = R.pipe(
    removeHeadersAndPageNum,
    R.flatten,
    R.map((str) => str.replace(/\s{2,}/g, ' ').replace(/ ‐/, '-')),
    modulesFromText,
  );

  const pagesOfText = await getPagesTextFromPdf(fileData);
  const modulesArr = modulesArrFromPages(pagesOfText);
  const filterEmptyObject = R.reject(R.isEmpty);
  return filterEmptyObject(modulesArr.map((module) => parseModule(module, subLog)));
}

async function examTimetable(config) {
  const { year, semester } = config;
  const subLog = log.child({ year, semester });

  let url = `https://webrb.nus.edu.sg/examtt/Exam${year}`;
  if (semester < 3) {
    url += `/Semester ${semester}/Semester_${semester}_By_Date.pdf`;
  } else {
    const specialSem = semester - 2;
    url += `/Special Term Part ${specialSem}/Special_Term_Part${specialSem}_By_Date.pdf`;
  }
  let pdf;
  try {
    pdf = await gotCached(url, config);
  } catch (e) {
    log.error(e);
    log.info('Unable to download pdf file, continuing...');
    return null;
  }
  const data = await parseExamPdf(pdf, subLog);

  subLog.info(`parsed ${data.length} exam timetables`);
  const pathToWrite = path.join(
    config.destFolder,
    `${year}-${year + 1}`,
    `${semester}`,
    config.destFileName,
  );
  subLog.info(`saving to ${pathToWrite}`);
  await fs.outputJson(pathToWrite, data, { spaces: config.jsonSpace });
  return data;
}

export default examTimetable;
export {
  parseExamPdf,
  DATE_FORMAT,
  DATE_REGEX,
  TIME_REGEX,
  CODE_REGEX,
  TITLE_REGEX,
  FACULTY_REGEX,
};
