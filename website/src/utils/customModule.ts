import { castArray } from 'lodash';
import { CustomLesson, Module, WeekRange, Weeks, consumeWeeks } from 'types/modules';
import { CustomModuleLessonData } from 'types/reducers';

const CUSTOM_IDENTIFIER = 'CUSTOM';

export function validateCustomModuleCode(moduleCode: string): void {
  if (moduleCode.trim().length > 0 && !moduleCode.startsWith(CUSTOM_IDENTIFIER)) {
    throw new Error(
      `Invalid custom module code ${moduleCode}. Should begin with ${CUSTOM_IDENTIFIER}`,
    );
  }
}

export function appendCustomIdentifier(moduleCode: string): string {
  return `${CUSTOM_IDENTIFIER}${moduleCode}`;
}

export function removeCustomIdentifier(customModuleCode: string, ignoreValidation = false): string {
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

export class CustomModuleSerializer {
  private static readonly ESCAPE_DELIMITER = '\\';

  private static readonly CUSTOM_MODULE_DELIMITER = '|';

  private static readonly CUSTOM_MODULE_LESSON_DELIMITER = ';';

  private static readonly CUSTOM_MODULE_KEY_DELIMITER = ':';

  private static readonly CUSTOM_MODULE_SHORT_KEY_MAP: (keyof CustomLesson)[] = [
    'lessonType',
    'classNo',
    'venue',
    'day',
    'startTime',
    'endTime',
    'weeks',
  ];

  private static readonly CUSTOM_MODULE_SHORT_KEY_TO_INDEX: {
    [key in keyof CustomLesson]: number;
  } = Object.fromEntries(
    CustomModuleSerializer.CUSTOM_MODULE_SHORT_KEY_MAP.map((key, index) => [key, index]),
  ) as Record<keyof CustomLesson, number>;

  private static escapeDelimiter(str: string | boolean | undefined): string {
    if (str === undefined) return '';
    return str
      .toString()
      .replaceAll(
        CustomModuleSerializer.ESCAPE_DELIMITER,
        `${CustomModuleSerializer.ESCAPE_DELIMITER}${CustomModuleSerializer.ESCAPE_DELIMITER}`,
      )
      .replaceAll(
        CustomModuleSerializer.CUSTOM_MODULE_DELIMITER,
        `${CustomModuleSerializer.ESCAPE_DELIMITER}${CustomModuleSerializer.CUSTOM_MODULE_DELIMITER}`,
      )
      .replaceAll(
        CustomModuleSerializer.CUSTOM_MODULE_LESSON_DELIMITER,
        `${CustomModuleSerializer.ESCAPE_DELIMITER}${CustomModuleSerializer.CUSTOM_MODULE_DELIMITER}`,
      )
      .replaceAll(
        CustomModuleSerializer.CUSTOM_MODULE_KEY_DELIMITER,
        `${CustomModuleSerializer.ESCAPE_DELIMITER}${CustomModuleSerializer.CUSTOM_MODULE_KEY_DELIMITER}`,
      );
  }

  private static unescapeDelimiter(str: string): string {
    return str
      .replaceAll(
        `${CustomModuleSerializer.ESCAPE_DELIMITER}${CustomModuleSerializer.CUSTOM_MODULE_KEY_DELIMITER}`,
        CustomModuleSerializer.CUSTOM_MODULE_KEY_DELIMITER,
      )
      .replaceAll(
        `${CustomModuleSerializer.ESCAPE_DELIMITER}${CustomModuleSerializer.CUSTOM_MODULE_DELIMITER}`,
        CustomModuleSerializer.CUSTOM_MODULE_DELIMITER,
      )
      .replaceAll(
        `${CustomModuleSerializer.ESCAPE_DELIMITER}${CustomModuleSerializer.CUSTOM_MODULE_LESSON_DELIMITER}`,
        CustomModuleSerializer.CUSTOM_MODULE_LESSON_DELIMITER,
      )
      .replaceAll(
        `${CustomModuleSerializer.ESCAPE_DELIMITER}${CustomModuleSerializer.ESCAPE_DELIMITER}`,
        CustomModuleSerializer.ESCAPE_DELIMITER,
      );
  }

  private static serializeNumericWeeks(numericWeeks: number[]): string {
    const weekRanges: string[] = [];
    let start = numericWeeks[0];
    let end = start;

    for (let i = 1; i < numericWeeks.length; i++) {
      if (numericWeeks[i] === end + 1) {
        end = numericWeeks[i];
      } else {
        weekRanges.push(start === end ? start.toString() : `${start}-${end}`);
        start = numericWeeks[i];
        end = start;
      }
    }
    weekRanges.push(start === end ? start.toString() : `${start}-${end}`);

    return `n${weekRanges.join(',')}`;
  }

  private static serializeWeekRanges(weekRanges: WeekRange): string {
    return `d${weekRanges.start}|${weekRanges.end}|${weekRanges.weekInterval ?? ''}`;
  }

  private static serializeWeeks(weeks: Weeks): string {
    return consumeWeeks(
      weeks,
      CustomModuleSerializer.serializeNumericWeeks,
      CustomModuleSerializer.serializeWeekRanges,
    );
  }

  private static serializeCustomLesson(lesson: CustomLesson): string {
    return CustomModuleSerializer.CUSTOM_MODULE_SHORT_KEY_MAP.map(
      (key) =>
        (key === 'weeks'
          ? CustomModuleSerializer.serializeWeeks(lesson[key])
          : CustomModuleSerializer.escapeDelimiter(lesson[key])) || '',
    )
      .map(encodeURIComponent)
      .join(CustomModuleSerializer.CUSTOM_MODULE_KEY_DELIMITER);
  }

  static serializeCustomModuleList(lessonData: CustomModuleLessonData): string {
    return Object.entries(lessonData)
      .map(([moduleCode, { title, lessons }]) => {
        validateCustomModuleCode(moduleCode);

        const serializedLessons = lessons
          .map(CustomModuleSerializer.serializeCustomLesson)
          .join(CustomModuleSerializer.CUSTOM_MODULE_LESSON_DELIMITER);

        return [
          CustomModuleSerializer.escapeDelimiter(moduleCode),
          CustomModuleSerializer.escapeDelimiter(title),
          serializedLessons,
        ].join(CustomModuleSerializer.CUSTOM_MODULE_LESSON_DELIMITER);
      })
      .join(CustomModuleSerializer.CUSTOM_MODULE_DELIMITER);
  }

  private static deserializeNumericWeeks(serializedWeeks: string): number[] {
    const weeks: number[] = [];
    const parts = serializedWeeks.split(',');

    parts.forEach((part) => {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= (end || start); i++) {
        weeks.push(i);
      }
    });

    return weeks;
  }

  private static deserializeWeekRanges(serializedWeeks: string): WeekRange {
    const [start, end, weekInterval] = serializedWeeks.split('|');
    return {
      start,
      end,
      weekInterval: weekInterval ? Number(weekInterval) : undefined,
    };
  }

  private static deserializeWeeks(serialized: string): Weeks {
    const type = serialized[0];
    const serializedWeeks = serialized.slice(1);

    if (type === 'n') return CustomModuleSerializer.deserializeNumericWeeks(serializedWeeks);
    if (type === 'd') return CustomModuleSerializer.deserializeWeekRanges(serializedWeeks);

    throw new Error(`Invalid week range ${serializedWeeks}`);
  }

  private static deserializeCustomLesson(serialized: string): CustomLesson {
    const parts = CustomModuleSerializer.splitByUnescapedDelimiter(
      serialized,
      CustomModuleSerializer.CUSTOM_MODULE_KEY_DELIMITER,
    )
      .map(decodeURIComponent)
      .map(CustomModuleSerializer.unescapeDelimiter);

    return {
      lessonType: parts[CustomModuleSerializer.CUSTOM_MODULE_SHORT_KEY_TO_INDEX.lessonType],
      classNo: parts[CustomModuleSerializer.CUSTOM_MODULE_SHORT_KEY_TO_INDEX.classNo],
      venue: parts[CustomModuleSerializer.CUSTOM_MODULE_SHORT_KEY_TO_INDEX.venue],
      day: parts[CustomModuleSerializer.CUSTOM_MODULE_SHORT_KEY_TO_INDEX.day],
      startTime: parts[CustomModuleSerializer.CUSTOM_MODULE_SHORT_KEY_TO_INDEX.startTime],
      endTime: parts[CustomModuleSerializer.CUSTOM_MODULE_SHORT_KEY_TO_INDEX.endTime],
      weeks: CustomModuleSerializer.deserializeWeeks(
        parts[CustomModuleSerializer.CUSTOM_MODULE_SHORT_KEY_TO_INDEX.weeks],
      ),
    };
  }

  private static regexpEscape(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private static splitByUnescapedDelimiter(str: string, delimiter: string): string[] {
    const regex = new RegExp(
      `(?<!${CustomModuleSerializer.regexpEscape(
        CustomModuleSerializer.ESCAPE_DELIMITER,
      )})${CustomModuleSerializer.regexpEscape(delimiter)}`,
    );
    return str.split(regex);
  }

  static deserializeCustomModuleList(serialized: string | string[] | null): CustomModuleLessonData {
    return castArray(serialized)
      .map((value) =>
        Object.fromEntries(
          // Split by module delimiter, then deserialize each module
          CustomModuleSerializer.splitByUnescapedDelimiter(
            value ?? '',
            CustomModuleSerializer.CUSTOM_MODULE_DELIMITER,
          ).map((moduleString) => {
            const [moduleCode, title, ...serializedLessons] =
              CustomModuleSerializer.splitByUnescapedDelimiter(
                moduleString,
                CustomModuleSerializer.CUSTOM_MODULE_LESSON_DELIMITER,
              );
            return [
              moduleCode,
              {
                title,
                lessons: serializedLessons.map(CustomModuleSerializer.deserializeCustomLesson),
              },
            ];
          }),
        ),
      )
      .reduce((acc, val) => ({ ...acc, ...val }), {}); // Merge all deserialized objects into one
  }
}
