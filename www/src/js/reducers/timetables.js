// @flow
import type { FSA } from 'types/redux';
import type { ClassNo, LessonType, Semester } from 'types/modules';
import type { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import type { ColorMapping, TimetablesState } from 'types/reducers';

import _ from 'lodash';
import { persistReducer } from 'redux-persist';
import update from 'immutability-helper';

import config from 'config';
import createPersistConfig from 'storage/createPersistConfig';
import { ADD_MODULE, CHANGE_LESSON, REMOVE_MODULE, SET_TIMETABLE } from 'actions/timetables';
import { SET_EXPORTED_DATA } from 'actions/export';
import { getNewColor } from 'utils/colors';

const EMPTY_OBJECT = {};

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

// Map of semester to color mapping
const defaultSemColorMap = {};
function semColors(state: ColorMapping = defaultSemColorMap, action: FSA): ColorMapping {
  const moduleCode = _.get(action, 'payload.moduleCode');
  if (!moduleCode) return state;

  switch (action.type) {
    case ADD_MODULE:
      return {
        ...state,
        [moduleCode]: getNewColor(_.values(state)),
      };

    case REMOVE_MODULE:
      return _.omit(state, moduleCode);

    default:
      return state;
  }
}

// Map of semester to semTimetable.
export const defaultTimetableState: TimetablesState = {
  timetableConfig: {},
  colors: {},
  academicYear: config.academicYear,
};

export function timetablesReducer(
  state: TimetablesState = defaultTimetableState,
  action: FSA,
): TimetablesState {
  if (!action.payload || !action.payload.semester) {
    return state;
  }

  switch (action.type) {
    case SET_TIMETABLE: {
      const { semester, timetable, colors } = action.payload;

      return update(state, {
        timetableConfig: {
          [semester]: { $set: timetable || defaultSemTimetableConfig },
        },
        colors: {
          [semester]: { $set: colors || {} },
        },
      });
    }

    case ADD_MODULE:
    case REMOVE_MODULE:
    case CHANGE_LESSON: {
      const { semester } = action.payload;

      return update(state, {
        timetableConfig: {
          [semester]: { $set: semTimetable(state.timetableConfig[semester], action) },
        },
        colors: {
          [semester]: { $set: semColors(state.colors[semester], action) },
        },
      });
    }

    case SET_EXPORTED_DATA: {
      const { semester, timetable, colors } = action.payload;

      return {
        ...state,
        timetableConfig: { [semester]: timetable },
        colors: { [semester]: colors },
      };
    }
    default:
      return state;
  }
}

export default persistReducer(createPersistConfig('timetables'), timetablesReducer);

// Extract sem timetable and colors for a specific semester from TimetablesState
export function getSemesterTimetable(
  semester: Semester,
  state: TimetablesState,
): { timetable: SemTimetableConfig, colors: ColorMapping } {
  return {
    timetable: state.timetableConfig[semester] || EMPTY_OBJECT,
    colors: state.colors[semester] || EMPTY_OBJECT,
  };
}
