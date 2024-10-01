import { castArray } from 'lodash';
import { Module, WeekRange, Weeks, consumeWeeks } from 'types/modules';
import { Lesson } from 'types/timetables';

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

export function removeCustomIdentifier(
  customModuleCode: string,
  ignoreValidation?: boolean,
): string {
  if (!ignoreValidation) validateCustomModuleCode(customModuleCode);

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

// For numeric weeks, convert to week ranges and prepend with "n", e.g. [1, 2, 3, 5, 7, 8, 9] to n1-3,5,7-9
// For week ranges, convert object to | separated values prepended with "d"
function serializeWeeks(weeks: Weeks): string {
  return consumeWeeks(
    weeks,
    (numericWeeks) => {
      const weekRanges: string[] = [];
      let start = numericWeeks[0];
      let end = start;
      for (let i = 1; i < numericWeeks.length; i++) {
        if (numericWeeks[i] === end + 1) {
          end = numericWeeks[i];
        } else {
          if (start === end) {
            weekRanges.push(start.toString());
          } else {
            weekRanges.push(`${start}-${end}`);
          }
          start = numericWeeks[i];
          end = start;
        }
      }
      if (start === end) {
        weekRanges.push(start.toString());
      } else {
        weekRanges.push(`${start}-${end}`);
      }
      return `n${weekRanges.join(',')}`;
    },
    (weekRanges) =>
      `d${weekRanges.start}|${weekRanges.end}|${weekRanges.weekInterval ?? ''}|${
        weekRanges.weeks?.join(',') ?? ''
      }`,
  );
}

function serializeCustomModule(lesson: Lesson): string {
  validateCustomModuleCode(lesson.moduleCode);

  return CUSTOM_MODULE_SHORT_KEY_MAP.map(
    (key) => (key === 'weeks' ? serializeWeeks(lesson[key]) : escapeDelimeter(lesson[key])) || '',
  )
    .map(encodeURIComponent)
    .join(`${PRE_DELIMETER}${CUSTOM_MODULE_KEY_DELIMETER}`);
}

export function serializeCustomModuleList(lessons: Lesson[]): string {
  return lessons.map(serializeCustomModule).join(`${PRE_DELIMETER}${CUSTOM_MODULE_DELIMETER}`);
}

// converts serialized week range e.g. n1-3,5,7-9 to [1, 2, 3, 5, 7, 8, 9]
// converts week ranges to object with start, end, weekInterval and weeks
function deserializeWeeks(serialized: string): Weeks {
  const type = serialized[0];
  const serializedWeeks = serialized.slice(1);
  if (type === 'n') {
    const weeks: Weeks = [];
    const parts = serializedWeeks.split(',');
    parts.forEach((part) => {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        weeks.push(i);
      }
    });
    return weeks;
  } else if (type === 'd') {
    const parts = serializedWeeks.slice(1).split('|');
    return {
      start: parts[0],
      end: parts[1],
      weekInterval: parts[2] ? Number(parts[2]) : undefined,
      weeks: parts[3] ? parts[3].split(',').map(Number) : undefined,
    } as WeekRange;
  } else {
    throw new Error(`Invalid week range ${serializedWeeks}`);
  }
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
