import 'babel-polyfill';
import gulp from 'gulp';
import bunyan from 'bunyan';
import moment from 'moment';
import nusmoderator from 'nusmoderator';
import R from 'ramda';
import config from './config';
import tasks from './gulp-tasks';
import iterateSems from './gulp-tasks/utils/iterateSems';
import { REGULAR_SEMESTER, SPECIAL_SEMESTER } from './gulp-tasks/remote/cors';

const aMonthAgo = moment().subtract(1, 'months');
const acadObj = nusmoderator.academicCalendar.getAcadYear(aMonthAgo.toDate());
const schoolSem = nusmoderator.academicCalendar.getAcadSem(aMonthAgo.week());
const schoolYear = 2000 + parseInt(acadObj.year.substr(0, 2), 10);

const yearStart = config.defaults.year || schoolYear;
const yearEnd = yearStart + 1;

const log = bunyan.createLogger({
  name: 'gulpfile',
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
});
log.info(`gulp process started: parsing AY ${yearStart}/${yearEnd}`);

log.debug(`cache path is ${config.defaults.cachePath}`);

gulp.task('bulletinModules', () => {
  const subtasks = iterateSems({
    from: yearStart,
    to: yearEnd,
    semesters: [0, 1, 2, 3, 4],
    config: config.bulletinModules,
  });

  const bulletinModules = R.map(tasks.bulletinModules, subtasks);
  return Promise.all(bulletinModules);
});

gulp.task('cors', () => {
  const subtasks = iterateSems({
    from: yearStart,
    to: yearEnd,
    semesters: [REGULAR_SEMESTER, SPECIAL_SEMESTER],
    config: config.cors,
  });
  const cors = R.map(tasks.cors, subtasks);
  return Promise.all(cors);
});

gulp.task('corsBiddingStats', () => {
  const subtasks = iterateSems({
    from: yearStart,
    to: yearEnd,
    semesters: [1, 2],
    config: config.corsBiddingStats,
  });
  const corsBiddingStats = R.map(tasks.corsBiddingStats, subtasks);
  return Promise.all(corsBiddingStats);
});

gulp.task('examTimetable', () => {
  const subtasks = iterateSems({
    from: yearStart,
    to: yearEnd,
    semesters: [1, 2, 3, 4],
    config: config.examTimetable,
  });

  const examTimetables = R.map(tasks.examTimetable, subtasks);
  return Promise.all(examTimetables);
});

gulp.task('ivle', () => {
  const subtasks = iterateSems({
    from: yearStart,
    to: yearEnd,
    semesters: [1, 2, 3, 4],
    config,
  });
  const ivle = R.map(tasks.ivle, subtasks);
  return Promise.all(ivle);
});

gulp.task('moduleTimetableDelta', () => tasks.moduleTimetableDelta(config.moduleTimetableDelta));

gulp.task('venues', () => tasks.venues(config.venues));

gulp.task('remote', gulp.parallel(
  'bulletinModules',
  'cors',
  'corsBiddingStats',
  'examTimetable',
  'venues',
  'moduleTimetableDelta',
));

gulp.task('mergeCorsBiddingStats', () => {
  const toMerge = iterateSems({
    from: yearStart - 7,  // merge at most 7 years of bidding stats
    to: yearEnd,
    semesters: [1, 2],
    config: config.corsBiddingStats,
  });
  return tasks.mergeCorsBiddingStats(toMerge);
});

gulp.task('consolidateForSem', () => {
  const subtasks = iterateSems({
    from: yearStart,
    to: yearEnd,
    semesters: [1, 2, 3, 4],
    config,
  });
  const consolidateForSem = R.map(tasks.consolidateForSem, subtasks);
  return Promise.all(consolidateForSem);
});

gulp.task('splitForSem', () => {
  const subtasks = iterateSems({
    from: yearStart,
    to: yearEnd,
    semesters: [1, 2, 3, 4],
    config,
  });
  const splitForSem = R.map(tasks.splitForSem, subtasks);
  return Promise.all(splitForSem);
});

gulp.task('consolidateForYear', () => {
  const subtasks = iterateSems({
    from: yearStart,
    to: yearEnd,
    semesters: [schoolSem],
    config: config.consolidate,
  });
  const consolidateForYear = R.map(tasks.consolidateForYear, subtasks);
  return Promise.all(consolidateForYear);
});

gulp.task('splitForYear', () => {
  const subtasks = iterateSems({
    from: yearStart,
    to: yearEnd,
    semesters: [schoolSem],
    config,
  });
  const splitForYear = R.map(tasks.splitForYear, subtasks);
  return Promise.all(splitForYear);
});

gulp.task('local', gulp.series(
  'mergeCorsBiddingStats',
  'consolidateForSem',
  'splitForSem',
  'consolidateForYear',
  'splitForYear',
));

gulp.task('default', gulp.series('remote', 'local'));

