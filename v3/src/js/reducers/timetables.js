import _ from 'lodash';

import { ADD_MODULE, REMOVE_MODULE, CHANGE_LESSON } from 'actions/timetables';
import { getModuleTimetable } from 'utils/modules';

// Map of LessonType to array of lessons with the same ClassNo.
const defaultModuleLessonConfig = {};

function moduleLessonConfig(state = defaultModuleLessonConfig, action, entities) {
  switch (action.type) {
    case CHANGE_LESSON:
      return (() => {
        const { semester, moduleCode, lessonType, classNo } = action.payload;
        const module = entities.moduleBank.modules[moduleCode];
        const lessons = getModuleTimetable(module, semester);
        const newLessons = lessons.filter((lesson) => {
          return (lesson.LessonType === lessonType && lesson.ClassNo === classNo);
        });
        const newLessonsIncludingModuleCode = newLessons.map((lesson) => {
          return {
            ...lesson,
            ModuleCode: moduleCode,
            ModuleTitle: module.ModuleTitle,
          };
        });
        return {
          ...state,
          [lessonType]: newLessonsIncludingModuleCode,
        };
      })();
    default:
      return state;
  }
}

// Map of ModuleCode to module lesson config.
const defaultSemesterTimetableState = {};

function semesterTimetable(state = defaultSemesterTimetableState, action, entities) {
  const moduleCode = action.payload.moduleCode;
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

// Map of semester to semesterTimetable.
const defaultTimetableState = {};

function timetables(state = defaultTimetableState, action, entities) {
  switch (action.type) {
    case ADD_MODULE:
    case REMOVE_MODULE:
    case CHANGE_LESSON:
      return (() => {
        const newSemTimetable = semesterTimetable(state[action.payload.semester], action, entities);
        const newState = {
          ...state,
          [action.payload.semester]: newSemTimetable,
        };
        return newState;
      })();
    default:
      return state;
  }
}

export default timetables;
