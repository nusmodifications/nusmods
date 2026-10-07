import { difference, get, omit, uniq, values } from 'lodash-es';
import { Draft, produce } from 'immer';
import { createMigrate } from 'redux-persist';
import { PersistedState } from 'redux-persist/es/types';

import { PersistConfig } from 'storage/persistReducer';
import { LessonId, ModuleCode, Semester } from 'types/modules';
import { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import { ColorMapping, TimetableSlot, TimetableSlotData, TimetablesState } from 'types/reducers';

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
  ADD_TIMETABLE_SLOT,
  RENAME_TIMETABLE_SLOT,
  SWITCH_TIMETABLE_SLOT,
  DELETE_TIMETABLE_SLOT,
} from 'actions/timetables';
import { getNewColor } from 'utils/colors';
import { SET_EXPORTED_DATA } from 'actions/constants';
import { Actions } from '../types/actions';

// v3 introduces timetable save slots. Existing timetables become the implicit
// default slot lazily (see ensureSlots), so the migration only has to add the
// new empty maps.
export const migrateV2toV3 = (state: PersistedState) => ({
  ...state,
  slots: {},
  activeSlot: {},
  // FIXME: Remove the next line when _persist is optional again.
  // Cause: https://github.com/rt2zz/redux-persist/pull/919
  // Issue: https://github.com/rt2zz/redux-persist/pull/1170
  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  _persist: state?._persist!,
});

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
    3: migrateV2toV3,
  }),
  /* eslint-enable */
  version: 3,

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

    // Only the active timetable's lessons are archived - saved slots are
    // dropped along with the rest of last year's state, since the archive
    // shape only holds one TimetableConfig per academic year
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
      const { lessonIds, lessonType } = action.payload;
      return {
        ...state,
        [lessonType]: lessonIds,
      };
    }
    case ADD_LESSON: {
      const { lessonIds, lessonType } = action.payload;
      return {
        ...state,
        [lessonType]: uniq([...lessonIds, ...(get(state, lessonType, []) as LessonId[])]),
      };
    }
    case REMOVE_LESSON: {
      const { lessonIds, lessonType } = action.payload;
      return {
        ...state,
        [lessonType]: difference(get(state, lessonType) as LessonId[], lessonIds),
      };
    }
    case ADD_TA_MODULE:
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
    case ADD_TA_MODULE:
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
const DEFAULT_TA_STATE: ModuleCode[] = [];
function semTaModules(state = DEFAULT_TA_STATE, action: Actions): ModuleCode[] {
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

export const DEFAULT_SLOT_ID = '0';
export const DEFAULT_SLOT_TITLE = 'Timetable 1';
const DEFAULT_SLOT_DATA: TimetableSlotData = { lessons: {}, colors: {}, hidden: [], ta: [] };

export function nextSlotId(slots: TimetableSlot[]): string {
  const ids = slots.map((slot) => Number(slot.id));
  if (ids.length === 0) return DEFAULT_SLOT_ID;
  return String(Math.max(...ids) + 1);
}

function snapshotSlotData(state: TimetablesState, semester: Semester): TimetableSlotData {
  return {
    lessons: state.lessons[semester] ?? DEFAULT_SEM_TIMETABLE_CONFIG,
    colors: state.colors[semester] ?? DEFAULT_SEM_COLOR_MAP,
    hidden: state.hidden[semester] ?? DEFAULT_HIDDEN_STATE,
    ta: state.ta[semester] ?? DEFAULT_TA_STATE,
  };
}

// Semesters that have never used slots implicitly have a single active slot
// holding the live timetable. Materialize it before any slot manipulation.
function ensureSlots(
  draft: Draft<TimetablesState>,
  semester: Semester,
  liveData: TimetableSlotData,
) {
  if (!draft.slots[semester] || draft.slots[semester].length === 0) {
    draft.slots[semester] = [{ id: DEFAULT_SLOT_ID, title: DEFAULT_SLOT_TITLE, data: liveData }];
    draft.activeSlot[semester] = DEFAULT_SLOT_ID;
  }
}

function loadSlotData(draft: Draft<TimetablesState>, semester: Semester, data: TimetableSlotData) {
  draft.lessons[semester] = data.lessons;
  draft.colors[semester] = data.colors;
  draft.hidden[semester] = data.hidden;
  draft.ta[semester] = data.ta;
}

export const defaultTimetableState: TimetablesState = {
  lessons: {},
  colors: {},
  hidden: {},
  ta: {},
  slots: {},
  activeSlot: {},
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
        draft.ta[semester] = semTaModules(state.ta[semester], action);
      });
    }

    case ADD_TIMETABLE_SLOT: {
      const { semester, title, duplicateCurrent } = action.payload;

      return produce(state, (draft) => {
        const liveData = snapshotSlotData(state, semester);
        ensureSlots(draft, semester, liveData);
        const slots = draft.slots[semester];

        // Persist the current timetable into the outgoing active slot
        const active = slots.find((slot) => slot.id === draft.activeSlot[semester]);
        if (active) active.data = liveData;

        const newSlot = {
          id: nextSlotId(slots),
          title: title?.trim() || `Timetable ${slots.length + 1}`,
          data: duplicateCurrent ? liveData : DEFAULT_SLOT_DATA,
        };
        slots.push(newSlot);
        draft.activeSlot[semester] = newSlot.id;
        loadSlotData(draft, semester, newSlot.data);
      });
    }

    case SWITCH_TIMETABLE_SLOT: {
      const { semester, slotId } = action.payload;
      const slots = state.slots[semester];
      // Semesters without materialized slots only have the implicit active
      // slot, so there is nothing to switch to
      if (!slots || slots.length === 0) return state;

      const activeId = state.activeSlot[semester] ?? DEFAULT_SLOT_ID;
      const target = slots.find((slot) => slot.id === slotId);
      if (slotId === activeId || !target) return state;

      return produce(state, (draft) => {
        const active = draft.slots[semester].find((slot) => slot.id === activeId);
        if (active) active.data = snapshotSlotData(state, semester);
        draft.activeSlot[semester] = slotId;
        loadSlotData(draft, semester, target.data);
      });
    }

    case RENAME_TIMETABLE_SLOT: {
      const { semester, slotId, title } = action.payload;
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return state;

      const slots = state.slots[semester];
      const slotExists =
        slots && slots.length > 0
          ? slots.some((slot) => slot.id === slotId)
          : slotId === DEFAULT_SLOT_ID;
      if (!slotExists) return state;

      return produce(state, (draft) => {
        ensureSlots(draft, semester, snapshotSlotData(state, semester));
        const slot = draft.slots[semester].find((s) => s.id === slotId);
        if (slot) slot.title = trimmedTitle;
      });
    }

    case DELETE_TIMETABLE_SLOT: {
      const { semester, slotId } = action.payload;
      const slots = state.slots[semester];
      // The last remaining (or implicit) slot cannot be deleted
      if (!slots || slots.length <= 1) return state;

      const index = slots.findIndex((slot) => slot.id === slotId);
      if (index === -1) return state;

      return produce(state, (draft) => {
        draft.slots[semester].splice(index, 1);

        if (state.activeSlot[semester] === slotId) {
          // Activate the neighbouring slot and load its saved timetable
          const neighbour = slots[index + 1] ?? slots[index - 1];
          draft.activeSlot[semester] = neighbour.id;
          loadSlotData(draft, semester, neighbour.data);
        }
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
