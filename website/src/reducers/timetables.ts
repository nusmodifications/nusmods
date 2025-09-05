import { get, omit, uniq, values } from 'lodash';
import { produce } from 'immer';
import { createMigrate } from 'redux-persist';

import { PersistConfig } from 'storage/persistReducer';
import { LessonIndex, ModuleCode } from 'types/modules';
import { TaModulesConfig, ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import { ColorMapping, TimetablesState } from 'types/reducers';

import config from 'config';
import {
  ADD_MODULE,
  CHANGE_LESSON,
  ADD_LESSON,
  REMOVE_LESSON,
  HIDE_LESSON_IN_TIMETABLE,
  REMOVE_MODULE,
  RESET_TIMETABLE,
  SELECT_MODULE_COLOR,
  SET_HIDDEN_IMPORTED,
  SET_LESSON_CONFIG,
  SET_TA_IMPORTED,
  ADD_TA_MODULE,
  SET_TIMETABLE,
  SHOW_LESSON_IN_TIMETABLE,
  REMOVE_TA_MODULE,
  SET_TIMETABLES,
} from 'actions/timetables';
import { getNewColor } from 'utils/colors';
import { SET_EXPORTED_DATA } from 'actions/constants';
import { Actions } from '../types/actions';

export const persistConfig = {
  /* eslint-disable no-useless-computed-key */
  migrate: createMigrate({
    1: (state) => ({
      ...state,
      archive: {},
      // FIXME: Remove the next line when _persist is optional again.
      // Cause: https://github.com/rt2zz/redux-persist/pull/919
      // Issue: https://github.com/rt2zz/redux-persist/pull/1170
      // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      _persist: state?._persist!,
    }),
    2: (state) => ({
      ...state,
      ta: {},
      // FIXME: Remove the next line when _persist is optional again.
      // Cause: https://github.com/rt2zz/redux-persist/pull/919
      // Issue: https://github.com/rt2zz/redux-persist/pull/1170
      // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      _persist: state?._persist!,
    }),
  }),
  /* eslint-enable */
  version: 2,

  // Our own state reconciler archives old timetables if the acad year is different,
  // otherwise use the persisted timetable state
  stateReconciler: (
    inbound: TimetablesState,
    original: TimetablesState,
    _reduced: TimetablesState,
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
      const { lessonIndices, lessonType } = action.payload;
      if (!(lessonIndices && lessonType)) return state;
      return {
        ...state,
        [lessonType]: lessonIndices,
      };
    }
    case ADD_LESSON: {
      const { lessonIndices, lessonType } = action.payload;
      if (!(lessonIndices && lessonType)) return state;
      return {
        ...state,
        [lessonType]: uniq([...lessonIndices, ...state[lessonType]]),
      };
    }
    case REMOVE_LESSON: {
      const { lessonIndices: lessonIndicesToExclude, lessonType } = action.payload;
      if (!(lessonIndicesToExclude && lessonType)) return state;
      return {
        ...state,
        [lessonType]: [
          ...state[lessonType].filter(
            (lessonIndex: LessonIndex) => !lessonIndicesToExclude.includes(lessonIndex),
          ),
        ],
      };
    }
    case REMOVE_TA_MODULE:
    case SET_LESSON_CONFIG:
      return action.payload.lessonConfig;

    default:
      return state;
  }
}

// Map of ModuleCode to module lesson config.
const DEFAULT_SEM_TIMETABLE_CONFIG: SemTimetableConfig = {};
function semTimetable(
  state: SemTimetableConfig = DEFAULT_SEM_TIMETABLE_CONFIG,
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
    case ADD_LESSON:
    case REMOVE_LESSON:
    case REMOVE_TA_MODULE:
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
const DEFAULT_SEM_COLOR_MAP = {};
function semColors(state: ColorMapping = DEFAULT_SEM_COLOR_MAP, action: Actions): ColorMapping {
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
const DEFAULT_HIDDEN_STATE: ModuleCode[] = [];
function semHiddenModules(state = DEFAULT_HIDDEN_STATE, action: Actions) {
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

// Map of semester to list of TA modules
const DEFAULT_TA_STATE: TaModulesConfig = [];
function semTaModules(state = DEFAULT_TA_STATE, action: Actions): TaModulesConfig {
  if (!action.payload) {
    return state;
  }

  switch (action.type) {
    case ADD_TA_MODULE: {
      const { moduleCode } = action.payload;
      if (!moduleCode) return state;
      return uniq([...state, moduleCode]);
    }
    case REMOVE_TA_MODULE:
    case REMOVE_MODULE: {
      const { moduleCode: modulesToExclude } = action.payload;
      if (!modulesToExclude) return state;
      return state.filter((moduleCode: ModuleCode) => !modulesToExclude.includes(moduleCode));
    }
    default:
      return state;
  }
}

export const defaultTimetableState: TimetablesState = {
  lessons: {},
  colors: {},
  hidden: {},
  ta: {},
  academicYear: config.academicYear,
  archive: {},
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
    case SET_TIMETABLES: {
      const { lessons, taModules } = action.payload;
      return {
        ...state,
        lessons,
        ta: taModules,
      };
    }

    case SET_TIMETABLE: {
      const { semester, timetable, colors, hiddenModules, taModules } = action.payload;

      return produce(state, (draft) => {
        draft.lessons[semester] = timetable ?? DEFAULT_SEM_TIMETABLE_CONFIG;
        draft.colors[semester] = colors ?? {};
        draft.hidden[semester] = hiddenModules ?? [];
        draft.ta[semester] = taModules ?? [];
      });
    }

    case RESET_TIMETABLE: {
      const { semester } = action.payload;

      return produce(state, (draft) => {
        draft.lessons[semester] = DEFAULT_SEM_TIMETABLE_CONFIG;
        draft.colors[semester] = DEFAULT_SEM_COLOR_MAP;
        draft.hidden[semester] = DEFAULT_HIDDEN_STATE;
        draft.ta[semester] = DEFAULT_TA_STATE;
      });
    }

    case ADD_MODULE:
    case REMOVE_MODULE:
    case SELECT_MODULE_COLOR:
    case CHANGE_LESSON:
    case ADD_LESSON:
    case REMOVE_LESSON:
    case SET_LESSON_CONFIG:
    case HIDE_LESSON_IN_TIMETABLE:
    case SHOW_LESSON_IN_TIMETABLE:
    case ADD_TA_MODULE:
    case REMOVE_TA_MODULE: {
      const { semester } = action.payload;

      return produce(state, (draft) => {
        draft.lessons[semester] = semTimetable(draft.lessons[semester], action);
        draft.colors[semester] = semColors(state.colors[semester], action);
        draft.hidden[semester] = semHiddenModules(state.hidden[semester], action);
        const taModules = state.ta[semester];
        const taModulesList = taModules;
        draft.ta[semester] = semTaModules(taModulesList, action);
      });
    }

    case SET_EXPORTED_DATA: {
      const { semester, timetable, colors, hidden, ta } = action.payload;

      return {
        ...state,
        lessons: { [semester]: timetable },
        colors: { [semester]: colors },
        hidden: { [semester]: hidden },
        ta: { [semester]: ta },
      };
    }

    case SET_HIDDEN_IMPORTED: {
      const { semester, hiddenModules } = action.payload;
      return produce(state, (draft) => {
        draft.hidden[semester] = hiddenModules;
      });
    }

    case SET_TA_IMPORTED: {
      const { semester, taModules } = action.payload;
      return produce(state, (draft) => {
        draft.ta[semester] = taModules;
      });
    }

    default:
      return state;
  }
}

export default timetables;
