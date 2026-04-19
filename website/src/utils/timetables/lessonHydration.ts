import { map, mapValues } from 'lodash-es';

import { LessonIndex, RawLessonWithIndex, Module, ModuleCode, Semester } from 'types/modules';

import {
  ModuleLessonConfig,
  ModuleLessonConfigWithLessons,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
} from 'types/timetables';

import { ModulesMap } from 'types/reducers';
import { getModuleTimetable } from 'utils/modules';

const EMPTY_OBJECT = {};

// Replaces ClassNo in SemTimetableConfig with Array<Lesson>
export function hydrateSemTimetableWithLessons(
  semTimetableConfig: SemTimetableConfig,
  modules: ModulesMap,
  semester: Semester,
): SemTimetableConfigWithLessons {
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
): ModuleLessonConfigWithLessons {
  return mapValues(moduleLessonConfig, (lessonIndices: LessonIndex[]) => {
    const lessons = getModuleTimetable(module, semester);
    const lessonsWithIndices = map(lessons, (lesson, lessonIndex) => ({ ...lesson, lessonIndex }));
    const newLessons = lessonsWithIndices.filter((lesson: RawLessonWithIndex) =>
      lessonIndices.includes(lesson.lessonIndex),
    );
    return newLessons.map((lesson: RawLessonWithIndex) => ({
      ...lesson,
      moduleCode: module.moduleCode,
      title: module.title,
    }));
  });
}
