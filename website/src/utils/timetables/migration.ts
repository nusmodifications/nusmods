import {
  filter,
  first,
  get,
  isArray,
  isEqual,
  isNumber,
  keys,
  map,
  nth,
  pickBy,
  reduce,
  uniq,
} from 'lodash-es';

import {
  LessonIndex,
  ModuleCode,
  RawLesson,
  ModuleLessonMap,
  ClassNo,
  LessonId,
  Semester,
  LessonType,
  Module,
} from 'types/modules';

import {
  SemTimetableConfig,
  SemTimetableConfigV2,
  SemTimetableConfigV1,
  ModuleLessonConfig,
  ModuleLessonConfigV2,
  ModuleLessonConfigV1,
  TaModulesConfigV1,
} from 'types/timetables';
import { getModuleLessonMap, getModuleTimetable } from 'utils/modules';

import { serializeLessonDetails } from './lessonId';
import { ModulesMap } from 'types/reducers';

export function isV1(config: ClassNo | LessonIndex[] | [ClassNo] | LessonId[]): config is ClassNo {
  return !isArray(config);
}

export function isV2(config: LessonIndex[] | [ClassNo] | LessonId[]): config is LessonIndex[] {
  return isNumber(get(config, 0, undefined));
}

function migrateLessonTypeLessonsFromLessonIndicesToLessonIds(
  timetable: readonly RawLesson[],
  lessonMap: Readonly<ModuleLessonMap<RawLesson>>,
  lessonType: LessonType,
  lessonIndices: LessonIndex[],
  isTa: boolean,
): [ClassNo] | LessonId[] {
  const lessonsWithLessonType: Record<LessonId, RawLesson> = get(lessonMap, lessonType);
  const configLessons: Record<LessonId, RawLesson> = reduce(
    lessonIndices,
    (accumulatedDeserializedLessons, lessonIndex) => {
      const lesson = nth(timetable, lessonIndex);
      if (!lesson || lesson.lessonType !== lessonType) return accumulatedDeserializedLessons;
      const lessonId = serializeLessonDetails(lesson);
      return {
        ...accumulatedDeserializedLessons,
        [lessonId]: lesson,
      };
    },
    {} as Record<LessonId, RawLesson>,
  );

  const classNos: ClassNo[] = uniq(map(configLessons, 'classNo'));
  const lessonIds: LessonId[] = keys(configLessons);
  if (isTa || classNos.length !== 1) {
    return lessonIds;
  }

  const firstClassNo: ClassNo | undefined = first(classNos);
  const lessonsWithClassNo: Record<LessonId, RawLesson> = pickBy(
    lessonsWithLessonType,
    (lesson) => lesson.classNo === firstClassNo,
  );
  if (firstClassNo && isEqual(new Set(lessonIds), new Set(keys(lessonsWithClassNo)))) {
    return [firstClassNo];
  }

  return lessonIds;
}

/**
 * Migrates a semester's timetable config
 * @param semTimetableConfig the semester timetable config to migrate
 * @param taModulesConfig the TA lesson configs overrides the semester timetable config
 * @param modules the modules in the moduleBank, used to find `ClassNo` or `LessonId`
 * @param semester the semester of the timetable to migrate, used to find `ClassNo` or `LessonId`
 * @returns
 * - the migrated semester timetable config
 * - the migrated semester ta config
 * - whether it was previously migrated, to signal to skip dispatch
 */
export function migrateSemTimetableConfig(
  semTimetableConfig: SemTimetableConfig | SemTimetableConfigV2 | SemTimetableConfigV1,
  taModulesConfig: ModuleCode[] | TaModulesConfigV1,
  modules: ModulesMap,
  semester: Semester,
): {
  migratedSemTimetableConfig: SemTimetableConfig;
  migratedTaModulesConfig: ModuleCode[];
  alreadyMigrated: boolean;
} {
  return reduce(
    semTimetableConfig,
    (accumulatedSemTimetableConfig, moduleLessonConfig, moduleCode) => {
      const isTa = isArray(taModulesConfig)
        ? taModulesConfig.includes(moduleCode)
        : moduleCode in taModulesConfig;

      const module: Module | undefined = get(modules, moduleCode, undefined);
      if (!module) return accumulatedSemTimetableConfig;

      const timetable: readonly RawLesson[] = getModuleTimetable(module, semester);

      const lessonMap: Readonly<ModuleLessonMap<RawLesson>> = getModuleLessonMap(
        modules[moduleCode],
        semester,
      );
      const { migratedModuleLessonConfig, alreadyMigrated } = migrateModuleLessonConfig(
        moduleLessonConfig,
        taModulesConfig,
        moduleCode,
        timetable,
        lessonMap,
        isTa,
      );

      return {
        migratedSemTimetableConfig: {
          ...accumulatedSemTimetableConfig.migratedSemTimetableConfig,
          [moduleCode]: migratedModuleLessonConfig,
        },
        migratedTaModulesConfig: isTa
          ? [...accumulatedSemTimetableConfig.migratedTaModulesConfig, moduleCode]
          : accumulatedSemTimetableConfig.migratedTaModulesConfig,
        alreadyMigrated: accumulatedSemTimetableConfig.alreadyMigrated && alreadyMigrated,
      };
    },
    {
      migratedSemTimetableConfig: {},
      migratedTaModulesConfig: [],
      alreadyMigrated: true,
    } as {
      migratedSemTimetableConfig: SemTimetableConfig;
      migratedTaModulesConfig: ModuleCode[];
      alreadyMigrated: boolean;
    },
  );
}

/**
 * A helper function for migrateSemTimetableConfig\
 * Migrates a module's lesson config
 * @param moduleLessonConfig the module lesson config to migrate
 * @param taModulesConfig the TA lesson configs overrides the semester timetable config
 * @param moduleCode
 * @returns
 * - the migrated config
 * - whether it was previously migrated, to signal to skip dispatch
 */
export function migrateModuleLessonConfig(
  moduleLessonConfig: ModuleLessonConfig | ModuleLessonConfigV2 | ModuleLessonConfigV1,
  taModulesConfig: ModuleCode[] | TaModulesConfigV1,
  moduleCode: ModuleCode,
  timetable: readonly RawLesson[],
  lessonMap: Readonly<ModuleLessonMap<RawLesson>>,
  isTa: boolean,
): {
  migratedModuleLessonConfig: ModuleLessonConfig;
  alreadyMigrated: boolean;
} {
  return reduce(
    moduleLessonConfig,
    (accumulatedModuleLessonConfig, lessonsIdentifier, lessonType) => {
      if (!isV1(lessonsIdentifier)) {
        const configIsV2 = isV2(lessonsIdentifier);
        const migratedLessonConfig: [ClassNo] | LessonId[] = configIsV2
          ? migrateLessonTypeLessonsFromLessonIndicesToLessonIds(
              timetable,
              lessonMap,
              lessonType,
              lessonsIdentifier,
              isTa,
            )
          : lessonsIdentifier;

        return {
          ...accumulatedModuleLessonConfig,
          migratedModuleLessonConfig: {
            ...accumulatedModuleLessonConfig.migratedModuleLessonConfig,
            [lessonType]: migratedLessonConfig,
          },
          alreadyMigrated: accumulatedModuleLessonConfig.alreadyMigrated && !configIsV2,
        };
      }

      const taClassNos: [lessonType: LessonType, classNo: ClassNo][] = isArray(taModulesConfig)
        ? []
        : filter(
            taModulesConfig[moduleCode],
            (lessonTypeConfig) => lessonTypeConfig[0] === lessonType,
          );

      if (taClassNos.length === 0) {
        return {
          migratedModuleLessonConfig: {
            ...accumulatedModuleLessonConfig.migratedModuleLessonConfig,
            [lessonType]: [lessonsIdentifier],
          },
          alreadyMigrated: false,
        };
      }

      const classNos: Set<ClassNo> = new Set(map(taClassNos, '1'));
      const lessonIds: LessonId[] = keys(
        pickBy(lessonMap[lessonType], (lesson) => classNos.has(lesson.classNo)),
      );

      return {
        migratedModuleLessonConfig: {
          ...accumulatedModuleLessonConfig.migratedModuleLessonConfig,
          [lessonType]: lessonIds,
        },
        alreadyMigrated: false,
      };
    },
    {
      migratedModuleLessonConfig: {},
      alreadyMigrated: true,
    } as {
      migratedModuleLessonConfig: ModuleLessonConfig;
      alreadyMigrated: boolean;
    },
  );
}
