import { get, omit, values } from 'lodash';
import produce from 'immer';
import { createMigrate } from 'redux-persist';

import { PersistConfig } from 'storage/persistReducer';
import { ModuleCode } from 'types/modules';
import { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import { ColorMapping, ModulesMap, TimetablesState } from 'types/reducers';

import config from 'config';
import {
  ADD_CUSTOM_MODULE,
  ADD_MODULE,
  CHANGE_LESSON,
  DELETE_CUSTOM_MODULE,
  HIDE_LESSON_IN_TIMETABLE,
  MODIFY_CUSTOM_MODULE,
  REMOVE_MODULE,
  SELECT_MODULE_COLOR,
  SET_LESSON_CONFIG,
  SET_TIMETABLE,
  SHOW_LESSON_IN_TIMETABLE,
} from 'actions/timetables';
import { getNewColor } from 'utils/colors';
import { SET_EXPORTED_DATA } from 'actions/constants';
import { Actions } from '../types/actions';

export const persistConfig = {
  /* eslint-disable no-useless-computed-key */
  migrate: createMigrate({
    [1]: (state) => ({
      ...state,
      archive: {},
      // FIXME: Remove the next line when _persist is optional again.
      // Cause: https://github.com/rt2zz/redux-persist/pull/919
      // Issue: https://github.com/rt2zz/redux-persist/pull/1170
      // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      _persist: state?._persist!,
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
    { debug }: PersistConfig<TimetablesState>,
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

// Map of lessonType to ClassNo.
const defaultModuleLessonConfig: ModuleLessonConfig = {};

function moduleLessonConfig(
  state: ModuleLessonConfig = defaultModuleLessonConfig,
  action: Actions,
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
  action: Actions,
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
function semColors(state: ColorMapping = defaultSemColorMap, action: Actions): ColorMapping {
  const moduleCode = get(action, 'payload.moduleCode');
  if (!moduleCode) return state;

  switch (action.type) {
    case ADD_MODULE:
    case ADD_CUSTOM_MODULE:
      return {
        ...state,
        [moduleCode]: getNewColor(values(state)),
      };

    case REMOVE_MODULE:
    case DELETE_CUSTOM_MODULE:
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
const defaultHiddenState: ModuleCode[] = [];
function semHiddenModules(state = defaultHiddenState, action: Actions) {
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

// Map of semester to ModulesMap for custom modules
const defaultCustomModulesState: ModulesMap = {};
function semCustomModules(state: ModulesMap = defaultCustomModulesState, action: Actions): ModulesMap {
  if (!action.payload) {
    return state;
  }

  console.log(action);

  switch (action.type) {
    case ADD_CUSTOM_MODULE:
    case MODIFY_CUSTOM_MODULE:
      return {
        ...state,
        [action.payload.moduleCode]: action.payload.module,
      };
    case DELETE_CUSTOM_MODULE:
      return omit(state, [action.payload.moduleCode]);
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
  custom: {}, 
};

function timetables(
  state: TimetablesState = defaultTimetableState,
  action: Actions,
): TimetablesState {
  // All normal timetable actions should specify their semester
  if (!action.payload) {
    return state;
  }

  switch (action.type) {
    case SET_TIMETABLE: {
      const { semester, timetable, colors } = action.payload;

      return produce(state, (draft) => {
        draft.lessons[semester] = timetable || defaultSemTimetableConfig;
        draft.colors[semester] = colors || {};
      });
    }

    case ADD_CUSTOM_MODULE:
    case MODIFY_CUSTOM_MODULE: 
    case DELETE_CUSTOM_MODULE:
    case ADD_MODULE:
    case REMOVE_MODULE:
    case SELECT_MODULE_COLOR:
    case CHANGE_LESSON:
    case SET_LESSON_CONFIG:
    case HIDE_LESSON_IN_TIMETABLE:
    case SHOW_LESSON_IN_TIMETABLE:
    {
      const { semester } = action.payload;
      console.log(state.custom);

      return produce(state, (draft) => {
        draft.lessons[semester] = semTimetable(draft.lessons[semester], action);
        draft.colors[semester] = semColors(state.colors[semester], action);
        draft.hidden[semester] = semHiddenModules(state.hidden[semester], action);
        draft.custom[semester] = semCustomModules(state.custom[semester], action);
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
