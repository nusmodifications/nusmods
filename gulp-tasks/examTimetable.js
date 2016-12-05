import moment from 'moment';
import _ from 'lodash';
import R from 'ramda';
import gotCached from '../utils/gotCached';
import { getPagesTextFromPdf } from '../utils/pdf';

// matches dd/mm/yyyy or d/m/yy with any non-word delimiters
const DATE_REGEX = /[0-3]?[\d]\W[0-1]?[1-9]\W[20]{0,2}\d{2}/;
// matches 0900AM, 900PM or 9:00 PM and must end at line
const TIME_REGEX = /[0-2]?[1-9]\W?[0-5]\d\s?[AM|PM]{2}$/;

function modulesFromText(arr) {
  return arr.reduce((result, val) => {
    if (val === 'AM' || val === 'PM') {
      // create new module
      result.push([]);
    }
    // remove any whitespace seperators
    const values = val.split(/\s+/).reverse();
    result[result.length - 1].push(...values);
    return result;
  }, []);
}

function parseModule(module) {
  const moduleString = module.reverse().join('');
  // replace delimiters to '/'
  const date = moduleString.match(DATE_REGEX)[0].replace(/\W/g, '/');
  const time = moduleString.match(TIME_REGEX)[0];

  // faculty is index 0
  const faculty = module.shift();
  // module code and first word of module title are joined by whitespace
  const joinedCodeAndWord = module.slice(0, 1).join('').split(/\s+/);
  // remove module code and replace it with first word of module title
  const code = joinedCodeAndWord[0];
  module[0] = joinedCodeAndWord[1];

  const titleArr = R.splitWhen(R.test(/\d+/), module)[0];
  const title = titleArr.join(' ').trim();

  if (!moment(date, 'D/M/YYYY', true).isValid()) {
    throw new Error(`Module ${code}'s date format is wrong: ${date}`);
  }
  return {
    'Date': date,
    'Time': time,
    'Faculty': faculty,
    'Code': code,
    'Title': title,
  };
}

async function parseExamPdf(fileData) {
  const removeHeadersAndPageNum = R.map((page) => {
    const startOfData = R.findIndex(R.test(/[A-Z]{3}/), page);
    const endOfData = R.findLastIndex(R.test(/AM|PM/), page) + 1;
    return page.slice(startOfData, endOfData);
  });
  const removeWhiteSpace = R.filter(R.identity);
  const textArrFromItems = R.pipe(
    removeHeadersAndPageNum,
    R.flatten,
    R.map(R.trim),
    removeWhiteSpace,
    R.reverse,
  );

  const pagesOfItems = await getPagesTextFromPdf(fileData);
  const strings = textArrFromItems(pagesOfItems);
  const modulesArr = modulesFromText(strings);
  return R.map(parseModule, modulesArr);
}

async function getExamTimetables(config) {
  const { year, semester } = config;
  const url = `https://webrb.nus.edu.sg/examtt/Exam${year}/Semester ${semester}/Semester_${semester}_by_Module.pdf`;
  const fileData = await gotCached(url, {
    cachePath: 'cache',
    maxCacheAge: -1,
  });
  const data = await parseExamPdf(fileData);
  return data;
}

export default getExamTimetables;
