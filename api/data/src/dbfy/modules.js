// @flow

import type { Knex } from 'knex';
import R from 'ramda';
import { map, filter } from 'lodash';

import config from '../../config';
import mapKeysDeep from '../util/mapKeysDeep';
import { walkJsonDir } from '../util/walkDir';
import { maxInsertSize } from '../util/db';

// Type of object which maps a key (e.g. venue name, mod code) to a db id.
type IdMap = { [string]: number };

// NUS has ID 1
const SCHOOL_ID = { school_id: 1 };

// Functions which normalize module data obtained from JSON files
const removeModuleKeys = mapKeysDeep((key) => key.replace('Module', ''));
const camelizeAllKeys = mapKeysDeep((key) => key.replace(/[A-Z]/, R.toLower));
const processData = R.pipe(removeModuleKeys, camelizeAllKeys, R.values);

/**
 * Store modules for acadYear and semester into db.
 *
 * @param db database to store into
 * @param mods array of modules to be stored
 * @param acadYear the mods' academic year
 * @param semester the mods' semester
 */
async function storeModules(db: Knex, mods: Object[], acadYear: string, semester: number) {
  const modsToStore = mods.map((mod) => {
    const cleanMod = R.pick(
      [
        'code',
        'title',
        'description',
        'credit',
        'workload',
        'examDate',
        'department',
        'lecturePeriods',
        'tutorialPeriods',
        'types',
        'prerequisite',
        'preclusion',
        'corequisite',
      ],
      mod,
    );
    return {
      ...SCHOOL_ID,
      acadYear,
      semester,
      ...cleanMod,
    };
  });
  return db.batchInsert('modules', modsToStore, maxInsertSize(16));
}

/**
 * Store classes in mods into db.
 *
 * @param db database to store into
 * @param mods array of modules with classes to be stored
 * @param venueIdMap a map from venue names to their IDs in db
 * @param modIdMap a map from module codes to their IDs in db
 */
async function storeClasses(db: Knex, mods: Object[], venueIdMap: IdMap, modIdMap: IdMap) {
  const timetables = mods.map((mod) => {
    if (!mod.timetable) return null;
    return mod.timetable.map((modClass) => {
      const { venue, dayText, lessonType, weekText, ...cleanModClass } = modClass;
      return {
        ...cleanModClass,
        day: dayText,
        type: lessonType,
        weekFrequency: weekText,
        venue_id: venueIdMap[venue],
        module_id: modIdMap[mod.code],
      };
    });
  });
  const classes = R.flatten(filter(timetables));
  return db.batchInsert('classes', classes, maxInsertSize(8));
}

/**
 * Store CORS bidding stats in mods into db.
 *
 * @param db database to store into
 * @param mods array of modules with CORS bidding stats to be stored
 * @param modIdMap a map from module codes to their IDs in db
 */
async function storeBiddingStats(db: Knex, mods: Object[], modIdMap: IdMap) {
  const biddingStats = mods.map((mod) => {
    if (!mod.corsBiddingStats) return null;
    return mod.corsBiddingStats.map((bidStats) => ({
      ...bidStats,
      module_id: modIdMap[mod.code],
    }));
  });
  const stats = R.flatten(filter(biddingStats));
  await db.batchInsert('corsBiddingStats', stats, maxInsertSize(12));
}

/**
 * Store an acad year + semester's data into db.
 *
 * @param db database to store into
 * @param data data object to be stored
 * @param acadYear the mods' academic year
 * @param semester the mods' semester
 * @param venueIdMap a map from venue names to their IDs in db
 */
async function storeSemData(
  db: Knex,
  data: Object,
  acadYear: string,
  sem: string,
  venueIdMap: IdMap,
) {
  const semester = parseInt(sem, 10);
  const mods: Object[] = processData(data.modules);

  // Store modules
  await storeModules(db, mods, acadYear, semester);

  // Map inserted module codes to module IDs
  const modRows = await db
    .select('id', 'code')
    .from('modules')
    .where({ ...SCHOOL_ID, acadYear, semester });
  const modIdMap: IdMap = R.map(R.prop('id'), R.indexBy(R.prop('code'), modRows));

  // Store other stuff
  await storeClasses(db, mods, venueIdMap, modIdMap);
  await storeBiddingStats(db, mods, modIdMap);
}

/**
 * Store module data into db.
 *
 * @param db database to store into
 */
export default async function populateModules(db: Knex) {
  const { dataFolder } = config;
  const rawData = await walkJsonDir(dataFolder, 'index.json', 4);

  const venueRows = await db
    .select('id', 'name')
    .from('venues')
    .where(SCHOOL_ID);
  const venueIdMap: IdMap = R.map(R.prop('id'), R.indexBy(R.prop('name'), venueRows));

  await Promise.all(
    map(rawData, async (ayData, acadYear) => {
      // Only read data from valid acadYears
      if (!/^[0-9]{4}-[0-9]{4}$/.test(acadYear)) return;
      await Promise.all(
        map(ayData, async (semData, sem) => {
          // Only read data from valid sems
          if (isNaN(sem)) return; // eslint-disable-line no-restricted-globals
          await storeSemData(db, semData, acadYear, sem, venueIdMap);
        }),
      );
    }),
  );
}
