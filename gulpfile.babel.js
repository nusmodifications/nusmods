import path from 'path';
import moment from 'moment';
import gulp from 'gulp';
import fs from 'fs-promise';
import bunyan from 'bunyan';
import nusmoderator from 'nusmoderator';
import config from './config';
import tasks from './gulp-tasks';

const aMonthAgo = moment().subtract(1, 'months');
const acadObj = nusmoderator.academicCalendar.getAcadYear(aMonthAgo.toDate());
const schoolSem = nusmoderator.academicCalendar.getAcadSem(aMonthAgo.week());
const schoolYear = 2000 + parseInt(acadObj.year.substr(0, 2), 10);

const yearStart = config.defaults.year || schoolYear;
const yearEnd = yearStart + 1;

const log = bunyan.createLogger({name: 'gulpfile'});
log.info(`gulp process started: parsing AY ${yearStart}/${yearEnd}`);

log.debug(`cache path is ${config.defaults.cachePath}`);
// Ensure that cache folder is created
fs.ensureDirSync(config.defaults.cachePath);

async function getConfig(key) {
  return key ? config[key] : config.defaults;
}

function test(done) {
  console.log(schoolSem);
  done();
}

/*
gulp.task('bulletinModules', async () => {
  const bulletins = await tasks.getBulletinModules(config);
  const pathToWrite = path.join(
    config.destFolder,
    `${yearStart}-${yearEnd}`,
    semester,
    config.destFileName,
  );
  await fs.writeFile(cachedPath, body);
});
*/

async function examTimetable(year, semester) {
  const config = await getConfig('examTimetable');
  const examData = await tasks.getExamTimetables({
    ...config,
    year,
    semester,
  });
  const pathToWrite = path.join(
    config.destFolder,
    `${yearStart}-${yearEnd}`,
    `${semester}`,
    config.destFileName,
  );
  log.info(`saving to ${pathToWrite}`);
  await fs.writeJson(pathToWrite, examData, {spaces: config.jsonSpace});
  return examData;
}


gulp.task('examTimetable', () => examTimetable(yearStart, 2));

/*
gulp.task('remote', gulp.parallel(
  'bulletinModules',
  'cors',
  'corsBiddingStats',
  'examTimetable',
  'moduleTimetableDelta',
  'ivle',
  'venues'
));

gulp.task('local', gulp.series(
  'consolidate',
  'normalize',
  'split',
  'joinSems',
  'shell:runPrereqParser:ay2016to2017',
  'splitSems'
));
*/

gulp.task('default', test);
