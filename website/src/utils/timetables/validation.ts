import {
  filter,
  first,
  get,
  groupBy,
  isEqual,
  isNumber,
  keys,
  map,
  partition,
  pick,
  reduce,
  some,
} from 'lodash-es';

import { RawLessonWithIndex, Module, ModuleCode, Semester } from 'types/modules';

import { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';

import { ModuleCodeMap } from 'types/reducers';

import { getModuleTimetable } from 'utils/modules';
import { getRecoveryLessonIndices } from 'utils/timetables';

/**
 * Validates the modules in a timetable. It removes all modules which do not exist in
 * the provided module code map from the timetable and returns that as the first item
 * in the tuple, and the module code of all removed modules as the second item.
 *
 * @param timetable
 * @param moduleCodes
 * @returns {[SemTimetableConfig, ModuleCode[]]}
 */
export function validateTimetableModules(
  timetable: SemTimetableConfig,
  moduleCodes: ModuleCodeMap,
): [SemTimetableConfig, ModuleCode[]] {
  const [valid, invalid] = partition(
    Object.keys(timetable),
    (moduleCode: ModuleCode) => moduleCodes[moduleCode],
  );
  return [pick(timetable, valid), invalid];
}

/**
 * Validates TA module's {@link ModuleLessonConfig|lesson configs} based on a list of lessons to provide the lesson type info of each lesson
 *
 * Valid TA modules configs must have lesson indices that belong to the correct lesson type
 * @param lessonConfig {@link ModuleLessonConfig|lesson configs} to validate
 * @param validLessons {@link RawLessonWithIndex|lesson}s to validate against
 * @returns
 * - validated TA modules' {@link ModuleLessonConfig|lesson config}
 * - whether the input is valid, to signal to skip dispatch
 */
export function validateTaModuleLessons(
  lessonConfig: ModuleLessonConfig,
  validLessons: readonly RawLessonWithIndex[],
): {
  validatedLessonConfig: ModuleLessonConfig;
  valid: boolean;
} {
  const lessonsByType = groupBy(validLessons, (lesson) => lesson.lessonType);
  const { config: validatedLessonConfig, valid } = reduce(
    lessonConfig,
    (accumulatedValidationResult, configLessonIndices, lessonType) => {
      const validLessonIndices = map(lessonsByType[lessonType], 'lessonIndex');
      if (!validLessonIndices.length) {
        return {
          config: accumulatedValidationResult.config,
          valid: false,
        };
      }
      const hasInvalidLesson = some(
        configLessonIndices,
        (lessonIndex) => !validLessonIndices.includes(lessonIndex),
      );
      return {
        config: {
          ...accumulatedValidationResult.config,
          [lessonType]: hasInvalidLesson
            ? getRecoveryLessonIndices(lessonsByType[lessonType])
            : configLessonIndices,
        },
        valid: accumulatedValidationResult.valid && !hasInvalidLesson,
      };
    },
    { config: {}, valid: true } as { config: ModuleLessonConfig; valid: boolean },
  );

  return {
    validatedLessonConfig,
    valid,
  };
}

/**
 * Valid non-TA modules must have one and only one classNo for each lesson type
 * @param lessonConfig lesson configs to validate
 * @param validLessons lessons to validate against
 * @returns
 * - validated non-TA lesson config
 * - whether the input is valid, to signal to skip dispatch
 */
function validateNonTaModuleLesson(
  lessonConfig: ModuleLessonConfig,
  validLessons: readonly RawLessonWithIndex[],
): {
  validatedLessonConfig: ModuleLessonConfig;
  valid: boolean;
} {
  const lessonsByType = groupBy(validLessons, (lesson) => lesson.lessonType);
  const lessonTypesInLessonConfig = keys(lessonConfig);
  const { config: validatedLessonConfig, valid: configValid } = reduce(
    lessonsByType,
    (accumulatedValidationResult, lessonsWithLessonType, lessonType) => {
      const lessonTypeInLessonConfig = lessonTypesInLessonConfig.includes(lessonType);
      const configLessonIndices = lessonConfig[lessonType];
      const firstLessonIndex = first(configLessonIndices);

      if (
        !(
          lessonTypeInLessonConfig &&
          configLessonIndices.length &&
          isNumber(firstLessonIndex) &&
          firstLessonIndex < validLessons.length
        )
      ) {
        const validLessonIndices = getRecoveryLessonIndices(lessonsWithLessonType);
        return {
          config: {
            ...accumulatedValidationResult.config,
            [lessonType]: validLessonIndices,
          },
          valid: false,
        };
      }

      const firstLesson = get(validLessons, firstLessonIndex);
      const { classNo } = firstLesson;
      const classNoLessonIndices = map(
        filter(lessonsWithLessonType, (lesson) => lesson.classNo === classNo),
        'lessonIndex',
      );
      const configLessonIndicesValid = isEqual(
        new Set(configLessonIndices),
        new Set(classNoLessonIndices),
      );
      const validLessonIndices = configLessonIndicesValid
        ? classNoLessonIndices
        : getRecoveryLessonIndices(lessonsWithLessonType);

      return {
        config: {
          ...accumulatedValidationResult.config,
          [lessonType]: validLessonIndices,
        },
        valid: accumulatedValidationResult.valid && configLessonIndicesValid,
      };
    },
    { config: {}, valid: true } as { config: ModuleLessonConfig; valid: boolean },
  );

  const configLessonTypesValid = isEqual(
    new Set(keys(validatedLessonConfig)),
    new Set(lessonTypesInLessonConfig),
  );

  return {
    validatedLessonConfig,
    valid: configValid && configLessonTypesValid,
  };
}

/**
 * Validates the lesson config for a specific module. It replaces all lessons
 * which invalid class number with the first available class numbers, and
 * removes lessons that are no longer valid
 * @param semester
 * @param lessonConfig
 * @param module
 */
export function validateModuleLessons(
  semester: Semester,
  lessonConfig: ModuleLessonConfig,
  module: Module,
  isTa: boolean,
): { validatedLessonConfig: ModuleLessonConfig; valid: boolean } {
  const validLessons = getModuleTimetable(module, semester);

  if (isTa) {
    return validateTaModuleLessons(lessonConfig, validLessons);
  }

  return validateNonTaModuleLesson(lessonConfig, validLessons);
}
