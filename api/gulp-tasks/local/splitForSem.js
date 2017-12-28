import path from 'path';
import fs from 'fs-extra';
import bunyan from 'bunyan';
import R from 'ramda';
import timify from '../utils/timify';

/**
 * Splits semester data into different chunks.
 * By default outputs to:
 *   - moduleCodes.json
 *   - moduleList.json
 *   - timetable.json
 *   - moduleInformation.json
 *   - venueInformation.json
 *   - modules/XModule.json
 *   - modules/XModule/CorsBiddingStats.json
 *   - modules/XModule/ivle.json
 *   - modules/XModule/timetable.json
 *   - modules/XModule/index.json
 */

const SCHOOL_START_HOUR = '0600';
const SCHOOL_END_HOUR = '2400';

const log = bunyan.createLogger({ name: 'splitForSem' });

async function splitForSem(config) {
  const { year, semester } = config;
  const subLog = log.child({ year, semester });

  const basePath = path.join(
    config.consolidate.destFolder,
    `${year}-${year + 1}`,
    `${semester}`,
  );
  const pathToRead = path.join(basePath, config.consolidate.destFileName);
  const listOfModules = await fs.readJson(pathToRead);

  const thisConfig = config.split;

  function outputData(pathToWrite, data) {
    subLog.info(`saving to ${pathToWrite}`);
    fs.outputJson(pathToWrite, data, { spaces: thisConfig.jsonSpace });
  }
  function write(destPath, func) {
    const pathToWrite = path.join(
      basePath,
      destPath,
    );
    const data = func(listOfModules);
    return outputData(pathToWrite, data);
  }

  // moduleCodes.json
  // output: ['CS1010', ... ]
  write(
    thisConfig.destModuleCodes,
    R.pluck('ModuleCode'),
  );

  // moduleList.json
  // output: { 'CS1010': 'Introduction to Computer Science', ... }
  const collateModuleTitles = R.pipe(
    R.indexBy(R.prop('ModuleCode')),
    R.map(R.prop('ModuleTitle')),
  );
  write(
    thisConfig.destModuleList,
    collateModuleTitles,
  );

  // timetable.json
  write(
    thisConfig.destTimetableInformation,
    R.map(R.pick([
      'ModuleCode',
      'ModuleTitle',
      'Timetable',
    ])),
  );

  // moduleInformation.json
  write(
    thisConfig.destModuleInformation,
    R.map(R.pick([
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
      'ExamDate',
      'Types',
      'Lecturers',
      'LecturePeriods',
      'TutorialPeriods',
    ])),
  );

  // venueInformation.json
  const getLessons = R.chain((module) => {
    const timetable = module.Timetable || [];
    // insert 'ModuleCode' key into lessons
    return timetable.map(R.assoc('ModuleCode', module.ModuleCode));
  });
  const processTimetables = R.map((venueTimetable) => {
    const schoolDays = timify.getSchoolDays();
    // remove 'Venue' key from lessons
    const timetable = R.map(R.omit('Venue'), venueTimetable);
    return schoolDays.map((day) => {
      const lessons = R.filter(lesson => lesson.DayText === day, timetable);

      // Outputs the following:
      // availability: {
      //    "0800": "vacant",
      //    "0830": "vacant",
      //    "0900": "occupied",
      //    "0930": "occupied",
      //    ...
      //    "2330": "vacant"
      // }
      const availability = {};
      timify.getTimeRange(SCHOOL_START_HOUR, SCHOOL_END_HOUR).forEach((time) => {
        availability[time] = 'vacant';
      });

      // for each time slot that contains lesson, label as occupied
      lessons.forEach((lesson) => {
        timify.getTimeRange(lesson.StartTime, lesson.EndTime).forEach((time) => {
          availability[time] = 'occupied';
        });
      });

      return {
        Day: day,
        Classes: lessons,
        Availability: availability,
      };
    });
  });

  const collateVenues = R.pipe(
    getLessons,
    R.groupBy(R.prop('Venue')),
    R.omit(''), // Delete empty venue string
    processTimetables,
  );
  write(
    thisConfig.destVenueInformation,
    collateVenues,
  );

  // modules/*.json
  // modules/*/CorsBiddingStats.json
  // modules/*/ivle.json
  // modules/*/timetable.json
  // modules/*/index.json
  function writeModule(module) {
    const subBasePath = path.join(
      basePath,
      thisConfig.destSubfolder,
    );
    const fileNameToData = {
      '': module,
      index: module,
      corsbiddingstats: module.CorsBiddingStats || [],
      ivle: module.IVLE || [],
      timetable: module.Timetable || [],
    };

    const moduleCode = module.ModuleCode;
    return Object.entries(fileNameToData).map(([fileName, data]) => {
      let pathToWrite = path.join(subBasePath, moduleCode, `${fileName}.json`);
      if (fileName === '') { // save to parent folder instead of module folder
        pathToWrite = path.join(subBasePath, `${moduleCode}.json`);
      }
      return outputData(pathToWrite, data);
    });
  }
  await Promise.all(R.chain(writeModule, listOfModules));
}

export default splitForSem;
