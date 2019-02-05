// @flow

import type { ModuleCode } from 'types/modules';
import type { VenueInfo, VenueSearchOptions, VenueDetailList, VenueLesson } from 'types/venues';
import { OCCUPIED } from 'types/venues';
import { range, entries, padStart, groupBy, values } from 'lodash';
import { ZWSP } from 'utils/react';

import { tokenize } from './moduleSearch';
import { SCHOOLDAYS } from './timify';

/* eslint-disable import/prefer-default-export */

// Array of [0, 30, 100, 130, 200, 230, ...], used to create time strings at half hour intervals
// eg. 900 + hourDifference[2] // (9am + 2 * 30 minutes = 10am)
const hourDifference = range(48).map((i) => Math.floor(i / 2) * 100 + (i % 2) * 30);

const stringCompare =
  // Feature detect Intl API
  window.Intl && typeof window.Intl === 'object'
    ? // $FlowFixMe: Flow doesn't have Intl typedefs https://github.com/facebook/flow/issues/1270
      new Intl.Collator('en', { sensitivity: 'base', numeric: true }).compare
    : (a, b) => a.localeCompare(b);

export function sortVenues(venues: VenueInfo): VenueDetailList {
  return entries(venues).sort(([a], [b]) => stringCompare(a, b));
}

export function searchVenue(venues: VenueDetailList, search: string): VenueDetailList {
  // Search by name
  const tokens = tokenize(search.toLowerCase());

  return venues.filter(([name]) => {
    const lowercaseName = name.toLowerCase();
    return tokens.every((token) => lowercaseName.includes(token));
  });
}

export function filterAvailability(
  venues: VenueDetailList,
  options: VenueSearchOptions,
): VenueDetailList {
  const { day, time, duration } = options;

  return venues.filter(([, venue]) => {
    const start = time * 100;
    const dayAvailability = venue.find((availability) => availability.Day === SCHOOLDAYS[day]);
    if (!dayAvailability) return false;

    // Check that all half-hour slots within the time requested are vacant
    for (let i = 0; i < duration * 2; i++) {
      const timeString = padStart(String(start + hourDifference[i]), 4, '0');
      if (dayAvailability.Availability[timeString] === OCCUPIED) {
        return false;
      }
    }

    return true;
  });
}

export function getDuplicateModules(classes: VenueLesson[]): ModuleCode[] {
  const lessonsByTime = values(
    groupBy(classes, (lesson) => [
      lesson.StartTime,
      lesson.EndTime,
      lesson.WeekText,
      lesson.DayText,
    ]),
  );
  for (let i = 0; i < lessonsByTime.length; i++) {
    const lessons = lessonsByTime[i];
    if (lessons.length > 1 && lessons.every((lesson) => lesson.WeekText === lessons[0].WeekText)) {
      return lessons.map((lesson) => lesson.ModuleCode);
    }
  }

  return [];
}

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

export function mergeDualCodedModules(classes: VenueLesson[]): VenueLesson[] {
  let mergedModules = classes;
  let duplicateModules = getDuplicateModules(mergedModules);

  while (duplicateModules.length) {
    mergedModules = mergeModules(mergedModules, duplicateModules);
    duplicateModules = getDuplicateModules(mergedModules);
  }

  return mergedModules;
}

export function floorName(floor: number | string): string {
  if (typeof floor === 'string') {
    return `${floor.toLowerCase()} floor`;
  }

  const floorNumber = floor < 0 ? `B${-floor}` : floor;
  return `floor ${floorNumber}`;
}
