// @flow

import _ from 'lodash';

import { ADD_MODULE, REMOVE_MODULE, CHANGE_LESSON } from 'actions/timetables';
import { getModuleTimetable } from 'utils/modules';

import type { FSA } from 'redux';
import type {
  ClassNo,
  Lesson,
  LessonType,
  Module,
  ModuleCode,
  Semester,
  TimetableLesson,
} from 'types/modules';
import type {
  LessonConfig,
  SemTimetableConfig,
  TimetableConfig,
} from 'types/timetable';

// Map of LessonType to array of lessons with the same ClassNo.
const defaultModuleLessonConfig: LessonConfig = {};

function moduleLessonConfig(state: LessonConfig = defaultModuleLessonConfig,
                            action: FSA, entities): LessonConfig {
  switch (action.type) {
    case CHANGE_LESSON:
      return ((): LessonConfig => {
        const { semester, moduleCode, lessonType, classNo }:
          { semester: Semester, moduleCode: ModuleCode, lessonType: LessonType, classNo: ClassNo }
          = action.payload;
        const module: Module = entities.moduleBank.modules[moduleCode];
        const lessons: Array<Lesson> = getModuleTimetable(module, semester);
        const newLessons: Array<Lesson> = lessons.filter((lesson: Lesson): boolean => {
          return (lesson.LessonType === lessonType && lesson.ClassNo === classNo);
        });
        const lessonsWithModuleCode: Array<TimetableLesson> =
          newLessons.map((lesson: Lesson): TimetableLesson => {
            return {
              ...lesson,
              ModuleCode: moduleCode,
              ModuleTitle: module.ModuleTitle,
            };
          });
        return {
          ...state,
          [lessonType]: lessonsWithModuleCode,
        };
      })();
    default:
      return state;
  }
}

// Map of ModuleCode to module lesson config.
const defaultSemTimetableConfig: SemTimetableConfig = {};

function semTimetable(state: SemTimetableConfig = defaultSemTimetableConfig,
                      action: FSA, entities): SemTimetableConfig {
  const moduleCode: ModuleCode = action.payload.moduleCode;
  switch (action.type) {
    case ADD_MODULE:
      return {
        ...state,
        [moduleCode]: action.payload.moduleLessonConfig,
      };
    case REMOVE_MODULE:
      return _.omit(state, moduleCode);
    case CHANGE_LESSON:
      return {
        ...state,
        [moduleCode]: moduleLessonConfig(state[moduleCode], action, entities),
      };
    default:
      return state;
  }
}

// Map of semester to semTimetable.
const defaultTimetableConfig: TimetableConfig = {};

function timetables(state: TimetableConfig = defaultTimetableConfig,
                    action: FSA, entities): TimetableConfig {
  switch (action.type) {
    case ADD_MODULE:
    case REMOVE_MODULE:
    case CHANGE_LESSON:
      return {
        ...state,
        [action.payload.semester]: semTimetable(state[action.payload.semester], action, entities),
      };
    default:
      return state;
  }
}

export default timetables;
