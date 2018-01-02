// @flow
import type { FSA } from 'types/redux';
import type { ClassNo, LessonType } from 'types/modules';
import type { ModuleLessonConfig, TimetableConfig, SemTimetableConfig } from 'types/timetables';

import _ from 'lodash';

import { ADD_MODULE, REMOVE_MODULE, CHANGE_LESSON, SET_TIMETABLE } from 'actions/timetables';
import { SET_EXPORTED_DATA } from 'actions/export';

// Map of LessonType to ClassNo.
const defaultModuleLessonConfig: ModuleLessonConfig = {};

function moduleLessonConfig(
  state: ModuleLessonConfig = defaultModuleLessonConfig,
  action: FSA,
): ModuleLessonConfig {
  switch (action.type) {
    case CHANGE_LESSON: {
      if (!action.payload) return state;
      const classNo: ClassNo = action.payload.classNo;

      const lessonType: LessonType = action.payload.lessonType;

      if (!(classNo && lessonType)) return state;

      return {
        ...state,
        [lessonType]: classNo,
      };
    }
    default:
      return state;
  }
}

// Map of ModuleCode to module lesson config.
const defaultSemTimetableConfig: SemTimetableConfig = {};

function semTimetable(
  state: SemTimetableConfig = defaultSemTimetableConfig,
  action: FSA,
): SemTimetableConfig {
  const moduleCode = _.get(action, 'payload.moduleCode');
  if (!moduleCode) return state;

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
        [moduleCode]: moduleLessonConfig(state[moduleCode], action),
      };
    default:
      return state;
  }
}

// Map of semester to semTimetable.
const defaultTimetableConfig: TimetableConfig = {};

function timetables(state: TimetableConfig = defaultTimetableConfig, action: FSA): TimetableConfig {
  if (!action.payload) {
    return state;
  }

  switch (action.type) {
    case SET_TIMETABLE:
      return {
        ...state,
        [action.payload.semester]: action.payload.timetable || defaultSemTimetableConfig,
      };

    case ADD_MODULE:
    case REMOVE_MODULE:
    case CHANGE_LESSON:
      return {
        ...state,
        [action.payload.semester]: semTimetable(state[action.payload.semester], action),
      };

    case SET_EXPORTED_DATA:
      return {
        [action.payload.semester]: action.payload.timetable,
      };
    default:
      return state;
  }
}

export default timetables;
