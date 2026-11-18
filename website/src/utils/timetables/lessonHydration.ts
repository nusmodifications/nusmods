import { get, mapValues, pick, pickBy } from 'lodash-es';

import {
  ClassNo,
  LessonId,
  LessonType,
  Module,
  ModuleCode,
  ModuleLessonMap,
  RawLesson,
  Semester,
} from 'types/modules';

import {
  Lesson,
  ModuleLessonConfig,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
} from 'types/timetables';

import { ModulesMap } from 'types/reducers';
import { getModuleLessonMap } from 'utils/modules';
import { isClassNo } from './lessonId';

const EMPTY_OBJECT = {};

// Replaces ClassNo in SemTimetableConfig with Array<Lesson>
export function hydrateSemTimetableWithLessons(
  semTimetableConfig: SemTimetableConfig,
  modules: ModulesMap,
  semester: Semester,
): SemTimetableConfigWithLessons<Lesson> {
  return mapValues(
    semTimetableConfig,
    (moduleLessonConfig: ModuleLessonConfig, moduleCode: ModuleCode) => {
      const module: Module = modules[moduleCode];
      if (!module) return EMPTY_OBJECT;

      return hydrateModuleConfigWithLessons(moduleLessonConfig, module, semester);
    },
  );
}

// Replaces ClassNo in ModuleLessonConfig with Array<Lesson>
function hydrateModuleConfigWithLessons(
  moduleLessonConfig: ModuleLessonConfig,
  module: Module,
  semester: Semester,
): ModuleLessonMap<Lesson> {
  const lessonMap: Readonly<ModuleLessonMap<RawLesson>> = getModuleLessonMap(module, semester);
  return mapValues(
    moduleLessonConfig,
    (lessonIds: [ClassNo] | LessonId[], lessonType: LessonType) => {
      const lessonsWithLessonType: Record<LessonId, RawLesson> = get(lessonMap, lessonType, {});

      const lessons: Record<LessonId, RawLesson> = isClassNo(lessonIds)
        ? pickBy(lessonsWithLessonType, (lesson) => lesson.classNo === lessonIds[0])
        : pick(lessonsWithLessonType, lessonIds);
      return mapValues(lessons, (lesson) => ({
        ...lesson,
        moduleCode: module.moduleCode,
        title: module.title,
      }));
    },
  );
}
