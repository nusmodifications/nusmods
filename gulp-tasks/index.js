import bulletinModules from './remote/bulletinModules';
import cors from './remote/cors';
import corsBiddingStats from './remote/corsBiddingStats';
import examTimetable from './remote/examTimetable';
import ivle from './remote/ivle';
import moduleTimetableDelta from './remote/moduleTimetableDelta';
import venues from './remote/venues';
import mergeCorsBiddingStats from './local/mergeCorsBiddingStats';
import consolidateForSem from './local/consolidateForSem';
import consolidateForYear from './local/consolidateForYear';
import splitForSem from './local/splitForSem';
import splitForYear from './local/splitForYear';

export default {
  bulletinModules,
  cors,
  corsBiddingStats,
  examTimetable,
  ivle,
  moduleTimetableDelta,
  venues,
  mergeCorsBiddingStats,
  consolidateForSem,
  splitForSem,
  consolidateForYear,
  splitForYear,
};
