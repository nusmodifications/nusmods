import {
  first,
  get,
  isEmpty,
  isEqual,
  keys,
  map,
  mapValues,
  partition,
  pick,
  reduce,
  size,
  some,
} from 'lodash-es';

import {
  ClassNo,
  LessonId,
  Module,
  ModuleCode,
  ModuleLessonMap,
  RawLesson,
  Semester,
} from 'types/modules';

import { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';

import { ModuleCodeMap } from 'types/reducers';

import { getModuleLessonMap } from 'utils/modules';
import {
  deserializeLessonDetails,
  getClosestClassNo,
  getRecoveryClassNo,
  getRecoverySerializedLessonDetails,
  isClassNo,
} from './lessonId';

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
 * Valid TA modules configs must have `LessonId`s that belong to the correct lesson type
 * @param lessonConfig {@link ModuleLessonConfig|lesson configs} to validate
 * @param lessonMap of valid {@link RawLesson|RawLesson}s to validate against
 * @returns
 * - validated TA modules' {@link ModuleLessonConfig|lesson config}
 * - whether the input is valid, to signal to skip dispatch
 */
export function validateTaModuleLessons(
  lessonConfig: ModuleLessonConfig,
  lessonMap: Readonly<ModuleLessonMap<RawLesson>>,
): {
  validatedLessonConfig: ModuleLessonConfig;
  valid: boolean;
} {
  const {
    config: validatedLessonConfig,
    numberOfLessons,
    valid,
  } = reduce(
    lessonConfig,
    (accumulatedValidationResult, configLessonTypeLessonIds, lessonType) => {
      const validLessonTypeLessonIds: Set<LessonId> = new Set(keys(get(lessonMap, lessonType, {})));
      if (!validLessonTypeLessonIds.size) {
        return {
          ...accumulatedValidationResult,
          valid: false,
        };
      }
      const hasInvalidLesson =
        isClassNo(configLessonTypeLessonIds) ||
        some(configLessonTypeLessonIds, (lessonId) => !validLessonTypeLessonIds.has(lessonId));
      const validatedLessonTypeLessonIds: LessonId[] = hasInvalidLesson
        ? getRecoverySerializedLessonDetails(
            get(lessonMap, lessonType, {}),
            configLessonTypeLessonIds,
          )
        : configLessonTypeLessonIds;

      return {
        config: {
          ...accumulatedValidationResult.config,
          [lessonType]: validatedLessonTypeLessonIds,
        },
        numberOfLessons:
          accumulatedValidationResult.numberOfLessons + validatedLessonTypeLessonIds.length,
        valid: accumulatedValidationResult.valid && !hasInvalidLesson,
      };
    },
    { config: {}, numberOfLessons: 0, valid: true } as {
      config: ModuleLessonConfig;
      numberOfLessons: number;
      valid: boolean;
    },
  );

  if (numberOfLessons < 1 && !isEmpty(lessonMap)) {
    const recoveredModuleLessonConfig: ModuleLessonConfig = mapValues(
      lessonMap,
      (lessonTypeLessons) => getRecoverySerializedLessonDetails(lessonTypeLessons, []),
    );
    return {
      validatedLessonConfig: recoveredModuleLessonConfig,
      valid: false,
    };
  }

  return {
    validatedLessonConfig,
    valid,
  };
}

/**
 * Valid non-TA modules must have one and only one classNo for each lesson type
 * @param lessonConfig lesson configs to validate
 * @param lessonMap of valid {@link RawLesson|RawLesson}s to validate against
 * @returns
 * - validated non-TA lesson config
 *     - invalid lesson configs are recovered to lessons with the classNo of the first lesson in the invalid config
 *     - if a classNo cannot be obtained, the classNo of the first lesson in the timetable is used
 * - whether the input is valid, to signal to skip dispatch
 */
export function validateNonTaModuleLesson(
  lessonConfig: ModuleLessonConfig,
  lessonMap: Readonly<ModuleLessonMap<RawLesson>>,
): {
  validatedLessonConfig: ModuleLessonConfig;
  valid: boolean;
} {
  const lessonTypesInLessonConfig = keys(lessonConfig);

  const lessonTypesValidationResults = map(lessonMap, (validLessons, lessonType) => {
    const lessonTypeInLessonConfig: boolean = lessonTypesInLessonConfig.includes(lessonType);
    const configLessonIdentifier: [ClassNo] | LessonId[] = get(lessonConfig, lessonType, []);

    if (isClassNo(configLessonIdentifier)) {
      const firstLessonIdentifier: ClassNo = configLessonIdentifier[0];
      const isValidClassNo: boolean = some(
        validLessons,
        (lesson) => lesson.classNo === firstLessonIdentifier,
      );
      const classNo: ClassNo | null = isValidClassNo
        ? firstLessonIdentifier
        : getRecoveryClassNo(validLessons);

      return {
        lessonType,
        validLessonIds: classNo ? [classNo] : [],
        valid: isValidClassNo,
      };
    }

    const firstLessonId = first(configLessonIdentifier);
    if (!lessonTypeInLessonConfig || !firstLessonId) {
      const recoveryClassNo: ClassNo | null = getRecoveryClassNo(validLessons);
      return {
        lessonType,
        validLessonIds: recoveryClassNo ? [recoveryClassNo] : [],
        valid: false,
      };
    }

    if (size(pick(validLessons, configLessonIdentifier)) > 0) {
      const closestClassNo: ClassNo | null = getClosestClassNo(
        validLessons,
        configLessonIdentifier,
      );
      if (closestClassNo) {
        return {
          lessonType,
          validLessonIds: closestClassNo ? [closestClassNo] : [],
          valid: false,
        };
      }
    }

    try {
      const firstLessonClassNo: ClassNo = deserializeLessonDetails(firstLessonId).classNo;
      const isValidClassNo: boolean = some(
        validLessons,
        (lesson) => lesson.classNo === firstLessonClassNo,
      );
      const classNo: ClassNo | null = isValidClassNo
        ? firstLessonClassNo
        : getRecoveryClassNo(validLessons);

      return {
        lessonType,
        validLessonIds: classNo ? [classNo] : [],
        valid: false,
      };
    } catch {
      const recoveryClassNo: ClassNo | null = getRecoveryClassNo(validLessons);
      return {
        lessonType,
        validLessonIds: recoveryClassNo ? [recoveryClassNo] : [],
        valid: false,
      };
    }
  });

  const { config: validatedLessonConfig, valid: configValid } = reduce(
    lessonTypesValidationResults,
    (accumulated, { lessonType, validLessonIds, valid }) => {
      if (validLessonIds.length !== 1) {
        return accumulated;
      }
      return {
        config: {
          ...accumulated.config,
          [lessonType]: validLessonIds as [ClassNo],
        },
        valid: accumulated.valid && valid,
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
 * with invalid `ClassNo` or `LessonId` with the first available `ClassNo` or `LessonId`
 * removing lessons that are no longer valid
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
  const lessonMap = getModuleLessonMap(module, semester);

  if (isTa) {
    return validateTaModuleLessons(lessonConfig, lessonMap);
  }

  return validateNonTaModuleLesson(lessonConfig, lessonMap);
}
