import { range, sample, without } from 'lodash';

import { ColorIndex, SemTimetableConfig } from 'types/timetables';
import { ColorMapping } from 'types/reducers';
import { ModuleCode } from 'types/modules';

function generateInitialColors(numOfColors: number): ColorIndex[] {
  console.log(numOfColors);
  return range(numOfColors);
}

// Returns a new index that is not present in the current color index.
// If there are more than numOfColors modules already present,
// will try to balance the color distribution if randomize === true.
export function getNewColor(
  currentColors: ColorIndex[],
  numOfColors: number,
  randomize = true,
): ColorIndex {
  let availableColors = generateInitialColors(numOfColors);
  currentColors.forEach((index: ColorIndex) => {
    availableColors = without(availableColors, index);
    if (availableColors.length === 0) {
      availableColors = generateInitialColors(numOfColors);
    }
  });

  if (randomize) {
    return sample(availableColors) ?? availableColors[0];
  }

  return availableColors[0];
}

// Color lessons by a certain property of every lesson
// e.g. clbk([...], 'lessonType') colors lessons by their type
export function colorLessonsByKey<T>(
  lessons: T[],
  key: keyof T,
  numOfColors: number,
): (T & { colorIndex: ColorIndex })[] {
  const colorMap = new Map();

  return lessons.map((lesson) => {
    let colorIndex = colorMap.get(lesson[key]);
    if (!colorMap.has(lesson[key])) {
      colorIndex = getNewColor(Array.from(colorMap.values()), numOfColors, false);
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
  numOfColors: number,
): ColorMapping {
  const colorMap: ColorMapping = {};
  const colorsUsed: ColorIndex[] = [];
  const withoutColors: ModuleCode[] = [];

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
    const color = getNewColor(colorsUsed, numOfColors, false);
    colorMap[moduleCode] = color;
    colorsUsed.push(color);
  });

  return colorMap;
}
