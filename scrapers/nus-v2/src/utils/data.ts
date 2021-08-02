/**
 * Code for data mapping, cleanup and validation
 */

import { uniq, trim, groupBy, values } from 'lodash';
import { decode } from 'he';
import { VenueLesson } from '../types/venues';
import {
  DayText,
  LessonType,
  ModuleCode,
  SemesterData,
  SemesterDataCondensed,
} from '../types/modules';
import { ModuleAliases } from '../types/mapper';

export const ZWSP = '\u200b';

/**
 * Converts a word to a word-regex pair. The regex matches whole words.
 * This creates the regex beforehand so they are not created repeatedly in the
 * loop in titleize.
 */
const getWordRegex = (word: string): [string, RegExp] => [word, new RegExp(`\\b${word}\\b`, 'gi')];

/**
 * NUS specific title case function that accounts for school names, etc.
 */
const minorWords = ['and', 'or', 'the', 'a', 'an', 'to', 'of', 'in'].map(getWordRegex);
const abbreviations = ['NUS', 'MIT', 'IP', 'NA'].map(getWordRegex);
export function titleize(string: string) {
  let capitalized = string
    .toLowerCase()
    // http://stackoverflow.com/a/7592235
    .replace(/(?:^|\s\(?|-|\/)\S/g, (char) => char.toUpperCase());

  // Minor words are lowercase unless they are the first word of the title
  minorWords.forEach(([word, regex]) => {
    capitalized = capitalized.replace(regex, (match, index) => (index === 0 ? match : word));
  });

  // Abbreviations are uppercase regardless of where they are
  abbreviations.forEach(([abbr, regex]) => {
    capitalized = capitalized.replace(regex, abbr);
  });

  return capitalized;
}

export function decodeHTMLEntities(string: string) {
  return decode(string);
}

/**
 * Remove keys with empty values, null or strings like 'nil', 'none'
 * Mutates the input object
 */
const trimChars = ' \t\n.,!?/-_';
const nullStrings = new Set(['', 'nil', 'na', 'n/a', 'null', 'none']);
export function removeEmptyValues<T>(object: T, keys: (keyof T)[]) {
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
// Can't properly type this in TS without the use of any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trimValues<T extends Record<string, any>>(object: T, keys: (keyof T)[]): T {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === 'string') {
      // eslint-disable-next-line no-param-reassign
      object[key] = value.trim();
    }
  }

  return object;
}

/**
 * Find modules which have lessons that fall on the exact same times
 */
export function getDuplicateModules(classes: VenueLesson[]): ModuleCode[] {
  const lessonsByTime: VenueLesson[][] = values(
    groupBy(classes, (lesson) => [lesson.startTime, lesson.endTime, lesson.weeks, lesson.day]),
  );

  for (const lessons of lessonsByTime) {
    if (lessons.length > 1) {
      // Occasionally two classes share the same venue, so we don't count those
      const moduleCodes = uniq(lessons.map((lesson) => lesson.moduleCode));
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

  // We only want to keep lessons from modules not in the list (index = -1) and
  // lessons from the first module (index = 0) since the rest are duplicates
  return classes
    .filter((lesson) => modules.indexOf(lesson.moduleCode) < 1)
    .map((lesson) => {
      if (lesson.moduleCode !== modules[0]) return lesson;

      return {
        ...lesson,
        moduleCode: mergedModuleCode,
      };
    });
}

export function mergeDualCodedModules(
  classes: VenueLesson[],
): { lessons: VenueLesson[]; aliases: ModuleAliases } {
  // Repeatedly merge lessons that occupy the same space in the timetable
  let mergedModules = classes;
  let duplicateModules = getDuplicateModules(mergedModules);
  const aliases: ModuleAliases = {};

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

export const dayTextMap: Record<string, DayText> = {
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
  // Assume lessons on Sunday (7) are invalid
};

export const unrecognizedLessonTypes: Record<string, LessonType> = {
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

export const activityLessonType: Record<string, LessonType> = {
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

/**
 * In COVID-19 times, there were many classes that had the same venues (E-Learn_A,
 * E-Learn_B, E-Learn_C). This confused our algorithm to merge dual-coded modules
 * and created lots of false positives for module aliases. This avoid-list specifies
 * the names of the modules that should not be aliased with each other.
 *
 * See https://github.com/nusmodifications/nusmods/pull/3322
 */
export const modulesToAvoidMerging = new Set<string>([
  // Excluding Discrete Structures also excludes TIC1201 on top of CS1231/S, but
  // should not be a huge problem since TIC1201 is a distinctly different module.
  'Discrete Structures',
  'Programming Methodology',
  'Programming Methodology II',
  'Data Structures and Algorithms',
  'Graduate Research Seminar',
]);

export function isModuleOffered(module: {
  semesterData: (SemesterData | SemesterDataCondensed)[];
}): boolean {
  return module.semesterData && module.semesterData.length > 0;
}
