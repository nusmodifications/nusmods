// @flow

import { get, omit, values } from 'lodash';
import update from 'immutability-helper';
import { createMigrate } from 'redux-persist';

import type { PersistConfig } from 'storage/persistReducer';
import type { FSA } from 'types/redux';
import type { Semester } from 'types/modules';
import type { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import type { ColorMapping, TimetablesState } from 'types/reducers';

import config from 'config';
import {
  ADD_MODULE,
  CHANGE_LESSON,
  HIDE_LESSON_IN_TIMETABLE,
  REMOVE_MODULE,
  SELECT_MODULE_COLOR,
  SET_LESSON_CONFIG,
  SET_TIMETABLE,
  SHOW_LESSON_IN_TIMETABLE,
} from 'actions/timetables';
import { SET_EXPORTED_DATA } from 'actions/export';
import { getNewColor } from 'utils/colors';

const EMPTY_OBJECT = {};

export const persistConfig = {
  /* eslint-disable no-useless-computed-key */
  migrate: createMigrate({
    [1]: (state: TimetablesState) => ({
      ...state,
      archive: {},
    }),
  }),
  /* eslint-enable */
  version: 1,

  // Our own state reconciler archives old timetables if the acad year is different,
  // otherwise use the persisted timetable state
  stateReconciler: (
    inbound: TimetablesState,
    original: TimetablesState,
    reduced: TimetablesState,
    { debug }: PersistConfig,
  ): TimetablesState => {
    if (inbound.academicYear === original.academicYear) {
      return inbound;
    }

    if (debug) {
      // eslint-disable-next-line no-console
      console.log(
        'New academic year detected - resetting timetable and adding timetable to archive',
      );
    }

    return {
      ...original,
      archive: {
        ...inbound.archive,
        [inbound.academicYear]: inbound.lessons,
      },
    };
  },
};

// Map of LessonType to ClassNo.
const defaultModuleLessonConfig: ModuleLessonConfig = {};

function moduleLessonConfig(
  state: ModuleLessonConfig = defaultModuleLessonConfig,
  action: FSA,
): ModuleLessonConfig {
  if (!action.payload) return state;

  switch (action.type) {
    case CHANGE_LESSON: {
      const { classNo, lessonType } = action.payload;
      if (!(classNo && lessonType)) return state;
      return {
        ...state,
        [lessonType]: classNo,
      };
    }
    case SET_LESSON_CONFIG:
      return action.payload.lessonConfig;

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
  const moduleCode = get(action, 'payload.moduleCode');
  if (!moduleCode) return state;

  switch (action.type) {
    case ADD_MODULE:
      return {
        ...state,
        [moduleCode]: action.payload.moduleLessonConfig,
      };
    case REMOVE_MODULE:
      return omit(state, [moduleCode]);
    case CHANGE_LESSON:
    case SET_LESSON_CONFIG:
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
  const moduleCode = get(action, 'payload.moduleCode');
  if (!moduleCode) return state;

  switch (action.type) {
    case ADD_MODULE:
      return {
        ...state,
        [moduleCode]: getNewColor(values(state)),
      };

    case REMOVE_MODULE:
      return omit(state, moduleCode);

    case SELECT_MODULE_COLOR:
      return {
        ...state,
        [moduleCode]: action.payload.colorIndex,
      };

    default:
      return state;
  }
}

// Map of semester to list of hidden modules
const defaultHiddenState = [];
function semHiddenModules(state = defaultHiddenState, action: FSA) {
  if (!action.payload) {
    return state;
  }

  switch (action.type) {
    case HIDE_LESSON_IN_TIMETABLE:
      return [action.payload.moduleCode, ...state];
    case SHOW_LESSON_IN_TIMETABLE:
    case REMOVE_MODULE:
      return state.filter((c) => c !== action.payload.moduleCode);
    default:
      return state;
  }
}

export const defaultTimetableState: TimetablesState = {
  lessons: {},
  colors: {},
  hidden: {},
  academicYear: config.academicYear,
  archive: {},
};

function timetables(state: TimetablesState = defaultTimetableState, action: FSA): TimetablesState {
  // All normal timetable actions should specify their semester
  if (!action.payload || !action.payload.semester) {
    return state;
  }

  switch (action.type) {
    case SET_TIMETABLE: {
      const { semester, timetable, colors } = action.payload;

      return update(state, {
        lessons: {
          [semester]: { $set: timetable || defaultSemTimetableConfig },
        },
        colors: {
          [semester]: { $set: colors || {} },
        },
      });
    }

    case ADD_MODULE:
    case REMOVE_MODULE:
    case SELECT_MODULE_COLOR:
    case CHANGE_LESSON:
    case SET_LESSON_CONFIG:
    case HIDE_LESSON_IN_TIMETABLE:
    case SHOW_LESSON_IN_TIMETABLE: {
      const { semester } = action.payload;

      return update(state, {
        lessons: {
          [semester]: { $set: semTimetable(state.lessons[semester], action) },
        },
        colors: {
          [semester]: { $set: semColors(state.colors[semester], action) },
        },
        hidden: {
          [semester]: { $set: semHiddenModules(state.hidden[semester], action) },
        },
      });
    }

    case SET_EXPORTED_DATA: {
      const { semester, timetable, colors, hidden } = action.payload;

      return {
        ...state,
        lessons: { [semester]: timetable },
        colors: { [semester]: colors },
        hidden: { [semester]: hidden },
      };
    }

    default:
      return state;
  }
}

export default timetables;

// Extract sem timetable and colors for a specific semester from TimetablesState
export function getSemesterTimetable(
  semester: Semester,
  state: TimetablesState,
): { timetable: SemTimetableConfig, colors: ColorMapping } {
  return {
    timetable: state.lessons[semester] || EMPTY_OBJECT,
    colors: state.colors[semester] || EMPTY_OBJECT,
  };
}
