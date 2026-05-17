import { filter, isArray, map, reduce } from 'lodash-es';

import { LessonIndex, RawLessonWithIndex, ModuleCode } from 'types/modules';

import {
  ModuleLessonConfigV1,
  SemTimetableConfigV1,
  TaModulesConfigV1,
  ModuleLessonConfig,
  SemTimetableConfig,
} from 'types/timetables';

import { getLessonIndices, makeLessonIndicesMap } from 'utils/timetables';

/**
 * Migrates a semester's timetable config
 * @param semTimetableConfig the semester timetable config to migrate
 * @param taModulesConfig the TA lesson configs overrides the semester timetable config
 * @param modules the modules in the moduleBank, used to find lesson indices of the classNo
 * @param semester the semester of the timetable to migrate, used to find lesson indices of the classNo
 * @returns
 * - the migrated semester timetable config
 * - the migrated semester ta config
 * - whether it was previously migrated, to signal to skip dispatch
 */
export function migrateSemTimetableConfig(
  semTimetableConfig: SemTimetableConfig | SemTimetableConfigV1,
  taModulesConfig: ModuleCode[] | TaModulesConfigV1,
  getModuleSemesterTimetable: (moduleCode: ModuleCode) => readonly RawLessonWithIndex[],
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

      const timetable = getModuleSemesterTimetable(moduleCode);
      const { migratedModuleLessonConfig, alreadyMigrated } = migrateModuleLessonConfig(
        moduleLessonConfig,
        taModulesConfig,
        moduleCode,
        timetable,
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
  moduleLessonConfig: ModuleLessonConfig | ModuleLessonConfigV1,
  taModulesConfig: ModuleCode[] | TaModulesConfigV1,
  moduleCode: ModuleCode,
  timetable: readonly RawLessonWithIndex[],
): {
  migratedModuleLessonConfig: ModuleLessonConfig;
  alreadyMigrated: boolean;
} {
  const lessonIndicesMap = makeLessonIndicesMap(timetable);
  return reduce(
    moduleLessonConfig,
    (accumulatedModuleLessonConfig, lessonsIdentifier, lessonType) => {
      if (isArray(lessonsIdentifier)) {
        return {
          ...accumulatedModuleLessonConfig,
          migratedModuleLessonConfig: {
            ...accumulatedModuleLessonConfig.migratedModuleLessonConfig,
            [lessonType]: lessonsIdentifier,
          },
        };
      }

      const taClassNos = isArray(taModulesConfig)
        ? []
        : filter(
            taModulesConfig[moduleCode],
            (lessonTypeConfig) => lessonTypeConfig[0] === lessonType,
          );
      const classNos = taClassNos.length ? map(taClassNos, '1') : [lessonsIdentifier];

      const lessonIndices = reduce(
        classNos,
        (accumulatedLessonIndices, classNo) => {
          const lessonIndicesWithClassNo = getLessonIndices(
            lessonIndicesMap,
            lessonType,
            classNo,
          ) as (LessonIndex | undefined)[];
          if (!lessonIndicesWithClassNo || lessonIndicesWithClassNo.includes(undefined)) {
            throw new Error('Lesson indices missing');
          }
          return [...accumulatedLessonIndices, ...(lessonIndicesWithClassNo as LessonIndex[])];
        },
        [] as LessonIndex[],
      );

      return {
        migratedModuleLessonConfig: {
          ...accumulatedModuleLessonConfig.migratedModuleLessonConfig,
          [lessonType]: lessonIndices,
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
