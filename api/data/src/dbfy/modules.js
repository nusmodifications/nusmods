// @flow

import type { Knex } from 'knex';
import R from 'ramda';
import { map, filter } from 'lodash';

import config from '../../config';
import mapKeysDeep from '../util/mapKeysDeep';
import { walkJsonDir } from '../util/walkDir';
import { maxInsertSize } from '../util/db';

const SCHOOL_ID = { school_id: 1 };

const removeModuleKeys = mapKeysDeep((key) => key.replace('Module', ''));
const camelizeAllKeys = mapKeysDeep((key) => key.replace(/[A-Z]/, R.toLower));
const processData = R.pipe(removeModuleKeys, camelizeAllKeys, R.values);

async function storeSemData(
  db: Knex,
  semData,
  acadYear: string,
  sem: string,
  venues: { [string]: number },
) {
  const { modules } = semData;
  const semester = parseInt(sem, 10);
  const processed = processData(modules);

  // Store modules
  const modsToStore = processed.map((mod) => {
    const toStore = {
      ...SCHOOL_ID,
      acadYear,
      semester,
      ...mod,
    };
    return R.pick(
      [
        'acadYear',
        'semester',
        'school_id',
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
      toStore,
    );
  });
  await db.batchInsert('modules', modsToStore, maxInsertSize(16));

  // Map inserted module codes to module IDs
  const modRows = await db
    .select('id', 'code')
    .from('modules')
    .where({ ...SCHOOL_ID, acadYear, semester });
  const mods: { [string]: number } = R.map(R.prop('id'), R.indexBy(R.prop('code'), modRows));

  // Store classes
  const timetables = processed.map((mod) => {
    if (!mod.timetable) return null;
    return mod.timetable.map((modClass) => {
      const { venue, dayText, lessonType, weekText, ...cleanModClass } = modClass;
      return {
        ...cleanModClass,
        day: dayText,
        type: lessonType,
        weekFrequency: weekText,
        venue_id: venues[venue],
        module_id: mods[mod.code],
      };
    });
  });
  const classes = R.flatten(filter(timetables));
  await db.batchInsert('classes', classes, maxInsertSize(8));

  // Store bidding stats
  const biddingStats = processed.map((mod) => {
    if (!mod.corsBiddingStats) return null;
    return mod.corsBiddingStats.map((bidStats) => ({
      ...bidStats,
      module_id: mods[mod.code],
    }));
  });
  const stats = R.flatten(filter(biddingStats));
  await db.batchInsert('corsBiddingStats', stats, maxInsertSize(12));
}

export default async function populateModules(db: Knex) {
  const { dataFolder } = config;
  const rawData = await walkJsonDir(dataFolder, 'index.json', 4);

  const venueRows = await db
    .select('id', 'name')
    .from('venues')
    .where(SCHOOL_ID);
  const venues: { [string]: number } = R.map(R.prop('id'), R.indexBy(R.prop('name'), venueRows));

  await Promise.all(
    map(rawData, async (ayData, acadYear) => {
      // Only read data from valid acadYears
      if (!/^[0-9]{4}-[0-9]{4}$/.test(acadYear)) return;
      await Promise.all(
        map(ayData, async (semData, sem) => {
          // Only read data from valid sems
          if (isNaN(sem)) return; // eslint-disable-line no-restricted-globals
          await storeSemData(db, semData, acadYear, sem, venues);
        }),
      );
    }),
  );
}
