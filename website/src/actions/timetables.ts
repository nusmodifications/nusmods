import { each, flatMap, get, keys, mapValues, pickBy } from 'lodash-es';

import type {
  ColorIndex,
  Lesson,
  ModuleLessonConfig,
  SemTimetableConfig,
  SemTimetableConfigV1,
  SemTimetableConfigV2,
  TimetableConfig,
  TimetableConfigV1,
  TimetableConfigV2,
} from 'types/timetables';
import type { Dispatch, GetState } from 'types/redux';
import type { TaModulesMapV1, ColorMapping, TaModulesMap } from 'types/reducers';
import type {
  ClassNo,
  LessonId,
  LessonType,
  Module,
  ModuleCode,
  ModuleLessonMap,
  RawLesson,
  Semester,
  SemesterData,
} from 'types/modules';

import { fetchModule } from 'actions/moduleBank';
import { openNotification } from 'actions/app';
import { getModuleCondensed } from 'selectors/moduleBank';
import {
  getClosestLessonConfig,
  migrateSemTimetableConfig,
  randomModuleLessonConfig,
  validateModuleLessons,
  validateTimetableModules,
} from 'utils/timetables';
import { getModuleLessonMap, getModuleSemesterData } from 'utils/modules';
import { isClassNo } from 'utils/timetables/lessonId';

// Actions that should not be used directly outside of thunks
export const SET_TIMETABLE = 'SET_TIMETABLE' as const;
export const ADD_MODULE = 'ADD_MODULE' as const;
export const SET_HIDDEN_IMPORTED = 'SET_HIDDEN_IMPORTED' as const;
export const SET_TA_IMPORTED = 'SET_TA_IMPORTED' as const;
export const SWITCH_TIMETABLE_SLOT = 'SWITCH_TIMETABLE_SLOT' as const;
export const DELETE_TIMETABLE_SLOT = 'DELETE_TIMETABLE_SLOT' as const;
export const Internal = {
  setTimetable(
    semester: Semester,
    timetable: SemTimetableConfig | undefined,
    colors?: ColorMapping,
    hiddenModules?: ModuleCode[],
    taModules?: ModuleCode[],
  ) {
    return {
      type: SET_TIMETABLE,
      payload: { semester, timetable, colors, hiddenModules, taModules },
    };
  },

  addModule(semester: Semester, moduleCode: ModuleCode, moduleLessonConfig: ModuleLessonConfig) {
    return {
      type: ADD_MODULE,
      payload: {
        semester,
        moduleCode,
        moduleLessonConfig,
      },
    };
  },

  switchTimetableSlot(semester: Semester, slotId: string) {
    return {
      type: SWITCH_TIMETABLE_SLOT,
      payload: { semester, slotId },
    };
  },

  deleteTimetableSlot(semester: Semester, slotId: string) {
    return {
      type: DELETE_TIMETABLE_SLOT,
      payload: { semester, slotId },
    };
  },
};

export const ADD_TIMETABLE_SLOT = 'ADD_TIMETABLE_SLOT' as const;
export function addTimetableSlot(
  semester: Semester,
  options: { title?: string; duplicateCurrent?: boolean } = {},
) {
  return {
    type: ADD_TIMETABLE_SLOT,
    payload: {
      semester,
      title: options.title,
      duplicateCurrent: options.duplicateCurrent ?? false,
    },
  };
}

export const RENAME_TIMETABLE_SLOT = 'RENAME_TIMETABLE_SLOT' as const;
export function renameTimetableSlot(semester: Semester, slotId: string, title: string) {
  return {
    type: RENAME_TIMETABLE_SLOT,
    payload: { semester, slotId, title },
  };
}

// The timetable cannot render modules that are missing from the module bank,
// so a slot's modules must be fetched BEFORE its data is loaded into the live
// timetable. Modules only referenced by a saved slot may have been evicted
// from the module bank by older versions of the LRU logic.
export function switchTimetableSlot(semester: Semester, slotId: string) {
  return (dispatch: Dispatch, getState: GetState) => {
    const slot = getState().timetables.slots[semester]?.find((s) => s.id === slotId);
    return dispatch(fetchTimetableModules([slot?.data.lessons ?? {}])).then(() => {
      dispatch(Internal.switchTimetableSlot(semester, slotId));
      return dispatch(validateTimetable(semester));
    });
  };
}

export function deleteTimetableSlot(semester: Semester, slotId: string) {
  return (dispatch: Dispatch, getState: GetState) => {
    const { slots, activeSlot } = getState().timetables;
    const semesterSlots = slots[semester] ?? [];
    const index = semesterSlots.findIndex((slot) => slot.id === slotId);
    // Deleting the active slot loads the neighbouring slot's timetable, so
    // fetch the neighbour's modules first
    const neighbour =
      activeSlot[semester] === slotId
        ? (semesterSlots[index + 1] ?? semesterSlots[index - 1])
        : undefined;

    return dispatch(fetchTimetableModules([neighbour?.data.lessons ?? {}])).then(() => {
      dispatch(Internal.deleteTimetableSlot(semester, slotId));
      return dispatch(validateTimetable(semester));
    });
  };
}

export function addModule(semester: Semester, moduleCode: ModuleCode) {
  return (dispatch: Dispatch, getState: GetState) =>
    dispatch(fetchModule(moduleCode)).then(() => {
      const module: Module = getState().moduleBank.modules[moduleCode];

      if (!module) {
        dispatch(
          openNotification(`Cannot load ${moduleCode}`, {
            action: {
              text: 'Retry',
              handler: () => {
                dispatch(addModule(semester, moduleCode));
              },
            },
          }),
        );

        return;
      }

      const lessons: ModuleLessonMap<RawLesson> = getModuleLessonMap(module, semester);
      const moduleLessonConfig = randomModuleLessonConfig(lessons);

      dispatch(Internal.addModule(semester, moduleCode, moduleLessonConfig));
    });
}

export const REMOVE_MODULE = 'REMOVE_MODULE' as const;
export function removeModule(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: REMOVE_MODULE,
    payload: {
      semester,
      moduleCode,
    },
  };
}

export const RESET_TIMETABLE = 'RESET_TIMETABLE' as const;
export function resetTimetable(semester: Semester) {
  return {
    type: RESET_TIMETABLE,
    payload: {
      semester,
    },
  };
}

export const MODIFY_LESSON = 'MODIFY_LESSON' as const;
export function modifyLesson(activeLesson: Lesson) {
  return {
    type: MODIFY_LESSON,
    payload: {
      activeLesson,
    },
  };
}

export const CHANGE_LESSON = 'CHANGE_LESSON' as const;
export function changeLesson(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonType: LessonType,
  lessonIds: [ClassNo] | LessonId[],
) {
  return {
    type: CHANGE_LESSON,
    payload: {
      semester,
      moduleCode,
      lessonType,
      lessonIds,
    },
  };
}

export const ADD_LESSON = 'ADD_LESSON' as const;
export function addLesson(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonType: LessonType,
  lessonIds: LessonId[],
) {
  return {
    type: ADD_LESSON,
    payload: {
      semester,
      moduleCode,
      lessonType,
      lessonIds,
    },
  };
}

export const REMOVE_LESSON = 'REMOVE_LESSON' as const;
export function removeLesson(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonType: LessonType,
  lessonIds: LessonId[],
) {
  return {
    type: REMOVE_LESSON,
    payload: {
      semester,
      moduleCode,
      lessonType,
      lessonIds,
    },
  };
}

export const SET_LESSON_CONFIG = 'SET_LESSON_CONFIG' as const;
export function setLessonConfig(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonConfig: ModuleLessonConfig,
) {
  return {
    type: SET_LESSON_CONFIG,
    payload: {
      semester,
      moduleCode,
      lessonConfig,
    },
  };
}

export const CANCEL_MODIFY_LESSON = 'CANCEL_MODIFY_LESSON' as const;
export function cancelModifyLesson() {
  return {
    type: CANCEL_MODIFY_LESSON,
    payload: null,
  };
}

export function setTimetable(
  semester: Semester,
  timetable?: SemTimetableConfig,
  colors?: ColorMapping,
) {
  return (dispatch: Dispatch, getState: GetState) => {
    let validatedTimetable = timetable;
    if (timetable) {
      [validatedTimetable] = validateTimetableModules(timetable, getState().moduleBank.moduleCodes);
    }

    return dispatch(
      Internal.setTimetable(
        semester,
        validatedTimetable,
        colors,
        getState().timetables.hidden[semester] ?? [],
        getState().timetables.ta[semester] ?? [],
      ),
    );
  };
}

/**
 * Valid non-TA modules must have one and only one `ClassNo` for each lesson type\
 * Valid TA modules must have only `LessonId`s that belong to the correct lesson type
 * @param semester Semester in the timetable config to validate
 */
export function validateTimetable(semester: Semester) {
  return (dispatch: Dispatch, getState: GetState) => {
    const { timetables, moduleBank } = getState();

    const timetableConfig: TimetableConfig | TimetableConfigV2 | TimetableConfigV1 =
      timetables.lessons;
    const semTimetableConfig: SemTimetableConfig | SemTimetableConfigV2 | SemTimetableConfigV1 =
      timetableConfig[semester];

    const taTimetableConfig: TaModulesMap | TaModulesMapV1 = timetables.ta;
    const taModulesConfig = get(taTimetableConfig, semester, {});

    const {
      migratedSemTimetableConfig: timetable,
      migratedTaModulesConfig: ta,
      alreadyMigrated,
    } = migrateSemTimetableConfig(
      semTimetableConfig,
      taModulesConfig,
      moduleBank.modules,
      semester,
    );

    if (!alreadyMigrated) {
      dispatch(
        Internal.setTimetable(
          semester,
          timetable,
          timetables.colors[semester],
          timetables.hidden[semester],
          ta,
        ),
      );
    }

    // Check that all lessons for each module are valid. If they are not, we update it
    // such that they are
    each(timetable, (lessonConfig: ModuleLessonConfig, moduleCode: ModuleCode) => {
      const module: Module = get(moduleBank.modules, moduleCode);
      if (!module) return;

      const isTa = ta?.includes(moduleCode);

      const { validatedLessonConfig, valid } = validateModuleLessons(
        semester,
        lessonConfig,
        module,
        isTa,
      );

      if (!valid) dispatch(setLessonConfig(semester, moduleCode, validatedLessonConfig));
    });
  };
}

export function fetchTimetableModules(timetables: SemTimetableConfig[]) {
  const moduleCodes = new Set(flatMap(timetables, Object.keys));
  return fetchModules(moduleCodes);
}

export function fetchModules(moduleCodes: Set<ModuleCode>) {
  return (dispatch: Dispatch, getState: GetState) => {
    const validateModule = getModuleCondensed(getState());

    return Promise.all(
      Array.from(moduleCodes)
        .filter(validateModule)
        .map((moduleCode) => dispatch(fetchModule(moduleCode))),
    );
  };
}

export function setHiddenModulesFromImport(semester: Semester, hiddenModules: ModuleCode[]) {
  return (dispatch: Dispatch) => dispatch(setHiddenImported(semester, hiddenModules));
}

export function setHiddenImported(semester: Semester, hiddenModules: ModuleCode[]) {
  return {
    type: SET_HIDDEN_IMPORTED,
    payload: { semester, hiddenModules },
  };
}

export function setTaModulesFromImport(semester: Semester, taModules: ModuleCode[]) {
  return (dispatch: Dispatch) => dispatch(setTaImported(semester, taModules));
}

export function setTaImported(semester: Semester, taModules: ModuleCode[]) {
  return {
    type: SET_TA_IMPORTED,
    payload: { semester, taModules },
  };
}

export const SELECT_MODULE_COLOR = 'SELECT_MODULE_COLOR' as const;
export function selectModuleColor(
  semester: Semester,
  moduleCode: ModuleCode,
  colorIndex: ColorIndex,
) {
  return {
    type: SELECT_MODULE_COLOR,
    payload: {
      semester,
      moduleCode,
      colorIndex,
    },
  };
}

export const HIDE_LESSON_IN_TIMETABLE = 'HIDE_LESSON_IN_TIMETABLE' as const;
export function hideLessonInTimetable(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: HIDE_LESSON_IN_TIMETABLE,
    payload: { moduleCode, semester },
  };
}

export const SHOW_LESSON_IN_TIMETABLE = 'SHOW_LESSON_IN_TIMETABLE' as const;
export function showLessonInTimetable(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: SHOW_LESSON_IN_TIMETABLE,
    payload: { moduleCode, semester },
  };
}

export const ADD_TA_MODULE = 'ADD_TA_MODULE' as const;
/**
 * Adds a TA module to the semester's TA config
 * @param semester
 * @param moduleCode
 * @param taModuleLessonConfig TA modules use `LessonId`s that are the serialized lesson details
 * @returns
 */
export function addTaModule(
  semester: Semester,
  moduleCode: ModuleCode,
  taModuleLessonConfig: ModuleLessonConfig,
) {
  return {
    type: ADD_TA_MODULE,
    payload: { semester, moduleCode, lessonConfig: taModuleLessonConfig },
  };
}

/**
 * While the non-TA modules use `ClassNo`s, the TA modules use `LessonId`s\
 * Thus, the corresponding lessons need to be obtained from the `ClassNo` of the non-TA config to create the TA config
 * @param semester
 * @param moduleCode
 * @returns
 */
export function enableTaModule(semester: Semester, moduleCode: ModuleCode) {
  return (dispatch: Dispatch, getState: GetState) => {
    const { moduleBank, timetables } = getState();
    const module: Module = get(moduleBank.modules, moduleCode);

    const semesterData: SemesterData | undefined = getModuleSemesterData(module, semester);
    if (!semesterData) {
      dispatch(addTaModule(semester, moduleCode, {}));
      return;
    }

    const moduleLessonConfig: ModuleLessonConfig = get(
      get(timetables.lessons, semester),
      moduleCode,
    );

    const taModuleLessonConfig: ModuleLessonConfig = mapValues(
      moduleLessonConfig,
      (lessonIdentifier, lessonType) => {
        const lessonsWithLessonType = get(semesterData.lessonMap, lessonType);
        if (!lessonsWithLessonType) return [];

        return isClassNo(lessonIdentifier)
          ? keys(pickBy(lessonsWithLessonType, (lesson) => lesson.classNo === lessonIdentifier[0]))
          : lessonIdentifier;
      },
    );

    dispatch(addTaModule(semester, moduleCode, taModuleLessonConfig));
  };
}

export const REMOVE_TA_MODULE = 'REMOVE_TA_MODULE' as const;
/**
 * A helper function for disableTaModule\
 * Removes a module from the semester's timetable TA modules list\
 * @param semester
 * @param moduleCode
 * @param lessonConfig The current lesson config is replaced with lessonConfig
 * because TA lesson configs use `LessonId` while non-TA lessons use `ClassNo`
 * @returns
 */
export function removeTaModule(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonConfig: ModuleLessonConfig,
) {
  return {
    type: REMOVE_TA_MODULE,
    payload: { semester, moduleCode, lessonConfig },
  };
}

/**
 * Removes a module from the semester's timetable TA modules list and
 * replaces the lesson config with the closest non-TA module lesson config\
 * @param semester Semester of timetable to remove the TA module from
 * @param moduleCode Module code of the TA module to remove
 */
export function disableTaModule(semester: Semester, moduleCode: ModuleCode) {
  return (dispatch: Dispatch, getState: GetState) => {
    const { moduleBank, timetables } = getState();
    const module: Module = get(moduleBank.modules, moduleCode);
    const taModuleLessonConfig: ModuleLessonConfig = get(
      get(timetables.lessons, semester),
      moduleCode,
    );

    const semesterData: SemesterData | undefined = getModuleSemesterData(module, semester);
    if (!semesterData) {
      dispatch(removeTaModule(semester, moduleCode, taModuleLessonConfig));
      return;
    }
    const lessonConfig: ModuleLessonConfig = getClosestLessonConfig(
      semesterData.lessonMap,
      taModuleLessonConfig,
    );

    dispatch(removeTaModule(semester, moduleCode, lessonConfig));
  };
}
