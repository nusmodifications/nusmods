import { castArray } from 'lodash';
import { Module, Weeks, consumeWeeks, isWeekRange } from 'types/modules';
import { Lesson } from 'types/timetables';
import { formatNumericWeeks } from './timetables';

const CUSTOM_IDENTIFIER = 'CUSTOM';
const PRE_DELIMETER = '\\';
const CUSTOM_MODULE_KEY_DELIMETER = ':';
const CUSTOM_MODULE_DELIMETER = '|';

const CUSTOM_MODULE_SHORT_KEY_MAP: (keyof Lesson)[] = [
  'moduleCode',
  'title',
  'lessonType',
  'classNo',
  'venue',
  'day',
  'startTime',
  'endTime',
  'weeks',
];
const CUSTOM_MODULE_SHORT_KEY_TO_INDEX: { [key in keyof Lesson]: number } = {
  moduleCode: 0,
  title: 1,
  lessonType: 2,
  classNo: 3,
  venue: 4,
  day: 5,
  startTime: 6,
  endTime: 7,
  weeks: 8,
};

function escapeDelimeter(str: string | boolean | undefined): string {
  if (str === undefined) return '';
  return str
    .toString()
    .replaceAll(PRE_DELIMETER, `${PRE_DELIMETER}${PRE_DELIMETER}`)
    .replaceAll(CUSTOM_MODULE_DELIMETER, `\\${CUSTOM_MODULE_DELIMETER}`)
    .replaceAll(CUSTOM_MODULE_KEY_DELIMETER, `\\${CUSTOM_MODULE_KEY_DELIMETER}`);
}

export function validateCustomModuleCode(moduleCode: string) {
  if (moduleCode.trim().length > 0 && !moduleCode.startsWith(CUSTOM_IDENTIFIER)) {
    throw new Error(
      `Invalid custom module code ${moduleCode}. Should begin with ${CUSTOM_IDENTIFIER}`,
    );
  }
}

export function appendCustomIdentifier(moduleCode: string): string {
  return `${CUSTOM_IDENTIFIER}${moduleCode}`;
}

export function removeCustomIdentifier(customModuleCode: string): string {
  validateCustomModuleCode(customModuleCode);

  return customModuleCode.replace(CUSTOM_IDENTIFIER, '');
}

export function createCustomModule(customModuleCode: string, title: string): Module {
  return {
    moduleCode: customModuleCode,
    title,
    isCustom: true,
    acadYear: '',
    moduleCredit: '0',
    department: '',
    faculty: '',
    semesterData: [],
    timestamp: 0,
  };
}

function serializeWeeks(weeks: Weeks): string {
  // Custom modules do not support week ranges,
  // only numeric weeks specified using the CustomModuleModalButtonGroup
  return (
    consumeWeeks(weeks, formatNumericWeeks, () => {
      throw new Error('Week ranges currently unsupported for custom modules');
    }) ?? ''
  );
}

function serializeCustomModule(lesson: Lesson): string {
  validateCustomModuleCode(lesson.moduleCode);

  return CUSTOM_MODULE_SHORT_KEY_MAP.map(
    (key) => (key == 'weeks' ? serializeWeeks(lesson[key]) : escapeDelimeter(lesson[key])) || '',
  )
    .map(encodeURIComponent)
    .join(`${PRE_DELIMETER}${CUSTOM_MODULE_KEY_DELIMETER}`);
}

export function serializeCustomModuleList(lessons: Lesson[]): string {
  return lessons.map(serializeCustomModule).join(`${PRE_DELIMETER}${CUSTOM_MODULE_DELIMETER}`);
}

// converts serialized week range e.g. 1-3,5,7-9 to [1, 2, 3, 5, 7, 8, 9]
function deserializeWeeks(serialized: string): Weeks {
  const weeks: Weeks = [];
  const parts = serialized.split(',');
  for (const part of parts) {
    const [start, end] = part.split('-').map(Number);
    for (let i = start; i <= end; i++) {
      weeks.push(i);
    }
  }
  return weeks;
}

function deserializeCustomModule(serialized: string): Lesson {
  const parts = serialized
    .split(`${PRE_DELIMETER}${CUSTOM_MODULE_KEY_DELIMETER}`)
    .map(decodeURIComponent)
    .map((str) =>
      str
        .replaceAll(`${PRE_DELIMETER}${PRE_DELIMETER}`, PRE_DELIMETER)
        .replaceAll(`${PRE_DELIMETER}${CUSTOM_MODULE_DELIMETER}`, CUSTOM_MODULE_DELIMETER)
        .replaceAll(`${PRE_DELIMETER}${CUSTOM_MODULE_KEY_DELIMETER}`, CUSTOM_MODULE_KEY_DELIMETER),
    );

  const lesson: Lesson = {
    moduleCode: parts[CUSTOM_MODULE_SHORT_KEY_TO_INDEX.moduleCode],
    title: parts[CUSTOM_MODULE_SHORT_KEY_TO_INDEX.title],
    lessonType: parts[CUSTOM_MODULE_SHORT_KEY_TO_INDEX.lessonType],
    classNo: parts[CUSTOM_MODULE_SHORT_KEY_TO_INDEX.classNo],
    venue: parts[CUSTOM_MODULE_SHORT_KEY_TO_INDEX.venue],
    day: parts[CUSTOM_MODULE_SHORT_KEY_TO_INDEX.day],
    startTime: parts[CUSTOM_MODULE_SHORT_KEY_TO_INDEX.startTime],
    endTime: parts[CUSTOM_MODULE_SHORT_KEY_TO_INDEX.endTime],
    weeks: deserializeWeeks(parts[CUSTOM_MODULE_SHORT_KEY_TO_INDEX.weeks]),
    isCustom: true,
  };

  return lesson;
}

// Converts a serialized list of custom modules to an array of Lesson objects
export function deserializeCustomModuleList(serialized: string | string[] | null): Lesson[] {
  return castArray(serialized).flatMap((value) =>
    (value ?? '')
      .split(`${PRE_DELIMETER}${CUSTOM_MODULE_DELIMETER}`)
      .flatMap(deserializeCustomModule),
  );
}
