import path from 'path';
import fs from 'fs-promise';
import bunyan from 'bunyan';
import R from 'ramda';
import moment from 'moment';
import clean from 'underscore.string/clean';
import { DATE_FORMAT as EXAM_DATE_FORMAT } from '../remote/examTimetable';
import { DATE_FORMAT as CORS_DATE_FORMAT } from '../remote/cors';
import mergeModuleFields from '../utils/mergeModuleFields';
import titleize from '../utils/titleize';

/**
 * Normalises then consolidates information for one semester.
 * By default outputs to:
 *   - modules.json
 *   - venues.json
 */

const MODULE_FIELDS = [
  'ModuleCode',
  'ModuleTitle',
  'Department',
  'ModuleDescription',
  'ModuleCredit',
  'Workload',
  'Types',
  'CrossModule',
  'Corequisite',
  'Prerequisite',
  'Preclusion',
  'ExamDate',
  'ExamDuration',
  'ExamOpenBook',
  'ExamVenue',
  'Timetable',
  'IVLE',
  'LecturePeriods',
  'Lecturers',
  'TutorialPeriods',
  'CorsBiddingStats',
];

const LESSON_FIELDS = [
  'LessonType',
  'ClassNo',
  'DayText',
  'StartTime',
  'EndTime',
  'WeekText',
  'Venue',
];

const log = bunyan.createLogger({ name: 'consolidateForSem' });

function normalize(data, subLog) {
  function normalizeSingleTimetable(timetable) {
    const toFourCharsTime = time => `000${time}`.slice(-4);
    const processLesson = R.evolve({
      StartTime: toFourCharsTime,
      EndTime: toFourCharsTime,
      DayText: titleize,
      WeekText: titleize,
      LessonType: titleize,
      Venue: R.trim,
    });
    return timetable.map(processLesson);
  }

  function normalizeSingleCors(cors) {
    function processExamDate(examDate) {
      if (examDate === 'No Exam Date.') {
        return '';
      }
      const dateTime = examDate.split(' ');
      if (dateTime.length !== 2) {
        throw new Error(`ExamDate of cors should contain whitespace, found: ${examDate}`);
      }
      const date = moment.utc(R.head(dateTime), CORS_DATE_FORMAT);
      switch (R.last(dateTime)) {
        case 'AM':
          date.hour(9);
          break;
        case 'PM':
          // 2.30 PM on Friday afternoons
          if (date.day() === 5) {
            date.hour(14).minute(30);
          } else {
            date.hour(13);
          }
          break;
        case 'EVENING':
          date.hour(17);
          break;
        default:
          subLog.error(`Unexpected exam time '${examDate}'`);
      }
      return `${date.toISOString().slice(0, 16)}+0800`;
    }
    const processTimetable = R.pipe(
      R.map(R.evolve({
        WeekText: R.replace('&nbsp;', ' '),
        Venue: R.replace(/(?:^null)?,$/, ''),
      })),
      normalizeSingleTimetable,
    );
    const processCors = R.evolve({
      ExamDate: processExamDate,
      Timetable: processTimetable,
    });
    return processCors(cors);
  }

  function normalizeCors(cors) {
    const corsMods = {};
    Object.values(cors).forEach((module) => {
      const mod = normalizeSingleCors(module);

      const codes = mod.ModuleCode.split(' / ');
      mod.Types = codes.map((code) => {
        if (/^GE[KM]\d/.test(code)) {
          return 'GEM';
        } else if (/^SS[A-Z]\d/.test(code)) {
          return 'SSM';
        }
        return mod.Type;
      });
      codes.forEach((code) => {
        corsMods[code] = corsMods[code] || R.omit(['Type'], mod);
        corsMods[code].ModuleCode = code;
        corsMods[code].Types = R.union(corsMods[code].Types, mod.Types);
      });
    });
    return corsMods;
  }

  function normalizeSingleTimetableDelta(timetableDelta) {
    const sortByLastModified = R.sortBy(R.prop('LastModified'));
    const isRedundant = lesson => lesson.isDelete || lesson.DayCode === '7'; // Sundays seem to be dummy values
    const removeRedundant = R.pipe(
      sortByLastModified,
      R.reverse,
      R.uniqBy(R.props(LESSON_FIELDS)), // only keep the latest
      R.reject(isRedundant),
      R.map(R.pick(LESSON_FIELDS)),
      normalizeSingleTimetable,
    );
    return removeRedundant(timetableDelta);
  }

  function normalizeSingleCorsBiddingStats(corsBiddingStats) {
    return corsBiddingStats.map(R.pipe(
      R.omit(['ModuleCode']),
      R.evolve({
        Group: titleize,
        Faculty: titleize,
        StudentAcctType: R.replace('<br>', ''),
      }),
    ));
  }

  function normalizeSingleExam(exam) {
    const examMoment = moment.utc(exam.Date.slice(0, 11) + exam.Time, `${EXAM_DATE_FORMAT} h:mm a`);
    const examString = `${examMoment.toISOString().slice(0, 16)}+0800`;

    let duration = '';
    if (exam.Duration) {
      duration = `P${exam.Duration.replace(/\s/g, '').toUpperCase().slice(0, 5)}`;
    }
    return {
      ModuleCode: exam.ModuleCode,
      ExamDate: examString,
      ExamDuration: duration,
      ExamOpenBook: exam[''] ? exam[''] === '*' : '',
      ExamVenue: exam.Venue || '',
    };
  }

  const normalizeData = R.evolve({
    cors: normalizeCors,
    corsBiddingStats: R.map(normalizeSingleCorsBiddingStats),
    examTimetable: R.map(normalizeSingleExam),
    moduleTimetableDelta: R.map(normalizeSingleTimetableDelta),
  });
  return normalizeData(data);
}

function consolidate(data, subLog) {
  const mainModuleCodes = [
    ...Object.keys(data.bulletinModules),
    ...Object.keys(data.cors),
  ];
  const auxilaryModuleCodes = [
    ...Object.keys(data.corsBiddingStats),
    ...Object.keys(data.examTimetable),
    ...Object.keys(data.moduleTimetableDelta),
    ...Object.keys(data.ivle),
  ];
  const moduleCodesWithoutData = R.difference(auxilaryModuleCodes, mainModuleCodes);
  // eslint-disable-next-line max-len
  subLog.warn(`${moduleCodesWithoutData.join(', ')} have no bulletin or cors data source and will be excluded.`);

  const allModuleCodes = mainModuleCodes;
  subLog.info(`parsing ${allModuleCodes.length} modules`);

  const dataTypes = Object.keys(data);
  const consolidated = R.fromPairs(allModuleCodes.map((moduleCode) => {
    const module = {};
    dataTypes.forEach((type) => {
      module[type] = data[type][moduleCode];
    });
    return [moduleCode, module];  // fromPairs turns [key, val] to { key: val }
  }));
  return consolidated;
}

function parseModule(rawModule, lessonTypes) {
  function titleizeIfAllCaps(val) {
    return val === val.toUpperCase() ? titleize(val) : val;
  }
  function cleanIfString(val) {
    return typeof val === 'string' ? clean(val) : val;
  }
  const module = R.pipe(
    R.evolve({
      Department: titleize,
      ModuleTitle: titleizeIfAllCaps,
    }),
    R.map(cleanIfString),
  )(rawModule);
  const lecturerNames = [];
  const lecturers = module.IVLE ? R.pluck('Lecturers', module.IVLE) : [];
  lecturers.forEach((lecturer) => {
    switch (lecturer.Role.trim()) {
      case 'Lecturer':
      case 'Co-Lecturer':
      case 'Visiting Professor':
        lecturerNames.push(lecturer.User.Name);
        break;
      default:
        log.warn(`${lecturer.Role.trim()} not recognised`);
    }
  });
  module.Lecturers = lecturerNames;

  const periods = { Lecture: new Set(), Tutorial: new Set() };
  module.Timetable.forEach((lesson) => {
    let period;
    if (lesson.StartTime < '1200') {
      period = 'Morning';
    } else if (lesson.StartTime < '1800') {
      period = 'Afternoon';
    } else {
      period = 'Evening';
    }
    // Either 'Lecture' or 'Tutorial'
    const lessonType = lessonTypes[R.toUpper(lesson.LessonType)];
    periods[lessonType].add(`${lesson.DayText} ${period}`);
  });
  module.LecturePeriods = [...periods.Lecture];
  module.TutorialPeriods = [...periods.Tutorial];
  return R.pipe(
    R.pick(MODULE_FIELDS),
    R.pickBy(val => val && !R.isEmpty(val)),
  )(module);
}

/**
 * Merges in the following order, taking the second object's value
 * if the key exists in both objects.
 * No First object               Second object
 * ====================================================
 * 1) cors           merge       bulletinModules
 * 2) examTimetable  merge       Module
 * 3) Module         merge       ivle
 * 4) Module         merge       corsBiddingStats
 * 5) Module         concat      moduleTimetableDelta
 */
function merge(consolidated, lessonTypes, subLog) {
  const merged = Object.entries(consolidated).map(([moduleCode, module]) => {
    const mergeModule = mergeModuleFields(subLog, moduleCode);

    const base = mergeModule(module.cors || {}, module.bulletinModules || {});
    const mergedModule = mergeModule(module.examTimetable || {}, base);
    mergedModule.IVLE = module.ivle;
    mergedModule.CorsBiddingStats = module.corsBiddingStats;
    mergedModule.Timetable = mergedModule.Timetable || module.moduleTimetableDelta || [];
    return parseModule(mergedModule, lessonTypes);
  });
  return merged;
}

function parseVenues(modules) {
  const lessons = R.pipe(
    R.pluck('Timetable'),
    R.unnest,
    R.filter(R.identity),
  )(modules);
  const venuesSet = new Set(R.pluck('Venue', lessons));
  return [...venuesSet];
}

async function consolidateForSem(config) {
  const { year, semester } = config;
  const subLog = log.child({ year, semester });

  const dataCategories = [
    'bulletinModules',
    'cors',
    'corsBiddingStats',
    'examTimetable',
    'moduleTimetableDelta',
    'ivle',
  ];

  const data = {};
  const missingFiles = [];
  async function readFile(category) {
    const filePath = path.join(
      config[category].destFolder,
      `${year}-${year + 1}`,
      `${semester}`,
      config[category].destFileName,
    );
    const catData = await fs.readJson(filePath).catch(() => {
      missingFiles.push(config[category].destFileName);
      return [];
    });
    const isCategoryDataArray = category === 'moduleTimetableDelta' ||
      category === 'corsBiddingStats';
    const func = isCategoryDataArray ? R.groupBy : R.indexBy;
    data[category] = func(R.prop('ModuleCode'), catData);
  }
  await Promise.all(R.map(readFile, dataCategories));
  if (missingFiles.length > 0) {
    subLog.info(`${missingFiles.join(', ')} are not found, continuing with consolidating.`);
  }

  const lessonTypesPath = path.join(config.cors.destFolder, config.cors.destLessonTypes);
  const lessonTypes = await fs.readJson(lessonTypesPath).catch(() => {
    subLog.info(`${lessonTypesPath} is not found, continuing with consolidating.`);
    return {};
  });

  const normalizedData = normalize(data, subLog);
  const consolidated = consolidate(normalizedData, subLog);
  const modules = merge(consolidated, lessonTypes, subLog);

  const venuesList = parseVenues(modules);

  const thisConfig = config.consolidate;
  async function write(filePath, content) {
    const pathToWrite = path.join(
      thisConfig.destFolder,
      `${year}-${year + 1}`,
      `${semester}`,
      filePath,
    );
    subLog.info(`saving to ${pathToWrite}`);
    await fs.outputJson(pathToWrite, content, { spaces: thisConfig.jsonSpace });
  }

  await Promise.all([
    write('consolidated.json', consolidated),
    write(thisConfig.destFileName, modules),
    write(thisConfig.destVenues, venuesList),
  ]);
}

export default consolidateForSem;
