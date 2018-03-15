// @flow
import { range, without, sample } from 'lodash';

import type { SemTimetableConfig } from 'types/timetables';
import type { ColorIndex, ColorMapping } from 'types/reducers';
import type { Lesson, ColoredLesson } from 'types/modules';

export const NUM_DIFFERENT_COLORS: number = 8;

// Returns a new index that is not present in the current color index.
// If there are more than NUM_DIFFERENT_COLORS modules already present,
// will try to balance the color distribution if randomize === true.
export function getNewColor(
  currentColorIndices: Array<ColorIndex>,
  randomize: boolean = true,
): ColorIndex {
  function generateInitialIndices(): Array<ColorIndex> {
    return range(NUM_DIFFERENT_COLORS);
  }

  let availableColorIndices = generateInitialIndices();
  currentColorIndices.forEach((index: ColorIndex) => {
    availableColorIndices = without(availableColorIndices, index);
    if (availableColorIndices.length === 0) {
      availableColorIndices = generateInitialIndices();
    }
  });

  if (randomize) {
    return sample(availableColorIndices);
  }
  return availableColorIndices[0];
}

// Color lessons by a certain property of every lesson
// e.g. clbk([...], 'LessonType') colors lessons by their type
export function colorLessonsByKey(lessons: Lesson[], key: $Keys<Lesson>): ColoredLesson[] {
  const colorMap = new Map();
  return lessons.map((lesson) => {
    let colorIndex = colorMap.get(lesson[key]);
    if (!colorMap.has(lesson[key])) {
      colorIndex = getNewColor(Array.from(colorMap.values()), false);
      colorMap.set(lesson[key], colorIndex);
    }

    return { ...lesson, colorIndex };
  });
}

// Fill up missing color slots given a timetable deterministically. This is useful
// when importing timetables since imported modules do not have any colors defined
// in the store
export function fillColorMapping(
  timetable: SemTimetableConfig,
  original: ColorMapping,
): ColorMapping {
  const colorMap = {};
  const colorsUsed = [];
  const withoutColors = [];

  // Collect a list of all colors used and all modules without colors
  Object.keys(timetable).forEach((moduleCode) => {
    if (moduleCode in original) {
      colorMap[moduleCode] = original[moduleCode];
      colorsUsed.push(Number(original[moduleCode]));
    } else {
      withoutColors.push(moduleCode);
    }
  });

  // Assign the modules without colors
  withoutColors.forEach((moduleCode) => {
    const color = getNewColor(colorsUsed, false);
    colorMap[moduleCode] = color;
    colorsUsed.push(color);
  });

  return colorMap;
}
