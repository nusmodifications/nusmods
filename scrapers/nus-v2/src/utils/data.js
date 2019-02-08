// @flow

/**
 * Code for data mapping, cleanup and validation
 */

import { uniq, trim, groupBy, values } from 'lodash';
import type { VenueLesson } from '../types/venues';
import type { LessonWeek, ModuleCode } from '../types/modules';
import type { ModuleAliases } from '../types/mapper';

export const ZWSP = '\u200b';

/**
 * NUS specific title case function that accounts for school names, etc.
 */
const minorWords = ['and', 'or', 'the', 'a', 'an', 'to', 'of', 'in'];
const abbreviations = ['NUS', 'MIT', 'IP', 'NA'];
export function titleize(string: string) {
  let capitalized = string
    .toLowerCase()
    // http://stackoverflow.com/a/7592235
    .replace(/(?:^|\s\(?|-|\/)\S/g, (char) => char.toUpperCase());

  // Minor words are lowercase unless they are the first word of the title
  minorWords.forEach((properCasing) => {
    const regex = new RegExp(`\\b${properCasing}\\b`, 'gi');
    capitalized = capitalized.replace(regex, (match, index) =>
      index === 0 ? match : properCasing,
    );
  });

  // Abbreviations are uppercase regardless of where they are
  abbreviations.forEach((abbreviation) => {
    const regex = new RegExp(`\\b${abbreviation}\\b`, 'gi');
    capitalized = capitalized.replace(regex, abbreviation);
  });

  return capitalized;
}

/**
 * Remove keys with empty values, null or strings like 'nil', 'none'
 * Mutates the input object
 */
const trimChars = ' \t\n.,!?/-_';
const nullStrings = new Set(['', 'nil', 'na', 'n/a', 'null', 'none']);
export function removeEmptyValues<T: Object>(object: T, keys: $Keys<T>[]) {
  /* eslint-disable no-param-reassign */
  keys.forEach((key) => {
    const value = object[key];

    if (!value) delete object[key];
    if (typeof value === 'string' && nullStrings.has(trim(value, trimChars).toLowerCase())) {
      delete object[key];
    }
  });
  /* eslint-enable */

  return object;
}

/**
 * Trim given values if they are strings
 * Mutates the input object
 */
export function trimValues<T: Object>(object: T, keys: $Keys<T>[]) {
  /* eslint-disable no-param-reassign */
  keys.forEach((key) => {
    const value = object[key];

    if (typeof value === 'string') {
      object[key] = value.trim();
    }
  });
  /* eslint-enable */

  return object;
}

/**
 * Find modules which have lessons that fall on the exact same times
 */
export function getDuplicateModules(classes: VenueLesson[]): ModuleCode[] {
  const lessonsByTime: VenueLesson[][] = values(
    groupBy(classes, (lesson) => [lesson.StartTime, lesson.EndTime, lesson.Weeks, lesson.DayText]),
  );

  for (const lessons of lessonsByTime) {
    if (lessons.length > 1) {
      // Occasionally two classes share the same venue, so we don't count those
      const moduleCodes = uniq(lessons.map((lesson) => lesson.ModuleCode));
      if (uniq(moduleCodes).length > 1) return moduleCodes;
    }
  }

  return [];
}

/**
 * Remove duplicated lessons given by the modules array and merge their module
 * codes
 */
export function mergeModules(classes: VenueLesson[], modules: ModuleCode[]): VenueLesson[] {
  const mergedModuleCode = modules.join(`/${ZWSP}`);
  const removeModuleCodes = new Set(modules.slice(1));

  return classes
    .filter((lesson) => !removeModuleCodes.has(lesson.ModuleCode))
    .map((lesson) =>
      lesson.ModuleCode === modules[0]
        ? {
            ...lesson,
            ModuleCode: mergedModuleCode,
          }
        : lesson,
    );
}

export function mergeDualCodedModules(
  classes: VenueLesson[],
): { lessons: VenueLesson[], aliases: ModuleAliases } {
  let mergedModules = classes;
  let duplicateModules = getDuplicateModules(mergedModules);
  const aliases = {};

  while (duplicateModules.length) {
    // Mark the current set of modules as aliases
    for (const moduleCode of duplicateModules) {
      if (!aliases[moduleCode]) aliases[moduleCode] = new Set();
      duplicateModules
        .filter((moduleToAdd) => moduleToAdd !== moduleCode)
        .forEach((moduleToAdd) => aliases[moduleCode].add(moduleToAdd));
    }

    // Merge the lessons of the dual-coded module together
    mergedModules = mergeModules(mergedModules, duplicateModules);
    duplicateModules = getDuplicateModules(mergedModules);
  }

  return { lessons: mergedModules, aliases };
}

const weekOrder = {
  Orientation: 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  Recess: 6.5,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  '11': 11,
  '12': 12,
  '13': 13,
  Reading: 14,
};

export function compareWeeks(a: LessonWeek, b: LessonWeek) {
  return weekOrder[a] - weekOrder[b];
}

export const dayTextMap = {
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
  // Assume lessons on Sunday (7) are invalid
};

export const unrecognizedLessonTypes = {
  // Not recognized by frontend
  '4': 'Tutorial Type 4',
  '5': 'Tutorial Type 5',
  '6': 'Tutorial Type 6',
  '7': 'Tutorial Type 7',
  '8': 'Tutorial Type 8',
  '9': 'Tutorial Type 9',
  A: 'Supervision of Academic Exercise',
  O: 'Others',
  V: 'Lecture On Demand',
  I: 'Independent Study Module',
  C: 'Bedside Tutorial',
  M: 'Ensemble Teaching',
  J: 'Mini-Project',
};

export const activityLessonType = {
  // Recognized by frontend
  B: 'Laboratory',
  L: 'Lecture',
  D: 'Design Lecture',
  R: 'Recitation',
  P: 'Packaged Lecture',
  X: 'Packaged Tutorial',
  W: 'Workshop',
  E: 'Seminar-Style Module Class',
  S: 'Sectional Teaching',
  T: 'Tutorial',
  '2': 'Tutorial Type 2',
  '3': 'Tutorial Type 3',

  ...unrecognizedLessonTypes,
};
