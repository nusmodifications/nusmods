// @flow
import type { FSA } from 'redux';
import type {
  RawLesson,
  Lesson,
  Module,
} from 'types/modules';
import type {
  LessonConfig,
  TimetableConfig,
  SemTimetableConfig,
} from 'types/timetable';

import _ from 'lodash';

import { ADD_MODULE, REMOVE_MODULE, CHANGE_LESSON } from 'actions/timetables';
import { getModuleTimetable } from 'utils/modules';

// Map of LessonType to array of lessons with the same ClassNo.
const defaultModuleLessonConfig: LessonConfig = {};

function moduleLessonConfig(state: LessonConfig = defaultModuleLessonConfig,
                            action: FSA, entities: any): LessonConfig {
  switch (action.type) {
    case CHANGE_LESSON:
      return (() => {
        const { semester, moduleCode, lessonType, classNo } = action.payload;
        const module: Module = entities.moduleBank.modules[moduleCode];
        const lessons: Array<RawLesson> = getModuleTimetable(module, semester);
        const newLessons: Array<RawLesson> = lessons.filter((lesson: RawLesson): boolean => {
          return (lesson.LessonType === lessonType && lesson.ClassNo === classNo);
        });
        const timetableLessons: Array<Lesson> = newLessons.map((lesson: RawLesson): Lesson => {
          return {
            ...lesson,
            ModuleCode: moduleCode,
            ModuleTitle: module.ModuleTitle,
          };
        });
        return {
          ...state,
          [lessonType]: timetableLessons,
        };
      })();
    default:
      return state;
  }
}

// Map of ModuleCode to module lesson config.
const defaultSemTimetableConfig: SemTimetableConfig = {};

function semTimetable(state: SemTimetableConfig = defaultSemTimetableConfig,
                      action: FSA, entities: any): SemTimetableConfig {
  const moduleCode = action.payload.moduleCode;
  switch (action.type) {
    case ADD_MODULE:
      return {
        ...state,
        [moduleCode]: action.payload.moduleLessonConfig,
      };
    case REMOVE_MODULE:
      return _.omit(state, [moduleCode]);
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
                    action: FSA, entities: any): TimetableConfig {
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
