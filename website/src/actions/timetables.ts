import { each, flatMap } from 'lodash';

import type {
  ColorIndex,
  ModuleLessonConfig,
  SemTimetableConfig,
  TimetableConfig,
  LessonWithIndex,
  TimetableConfigV1,
} from 'types/timetables';
import type { Dispatch, GetState } from 'types/redux';
import type { TaModulesMapV1, ColorMapping, TaModulesMap } from 'types/reducers';
import type { LessonIndex, LessonType, Module, ModuleCode, Semester } from 'types/modules';

import { fetchModule } from 'actions/moduleBank';
import { openNotification } from 'actions/app';
import { getModuleCondensed } from 'selectors/moduleBank';
import {
  getClosestLessonConfig,
  makeLessonIndicesMap,
  migrateTimetableConfigs,
  randomModuleLessonConfig,
  validateModuleLessons,
  validateTimetableModules,
} from 'utils/timetables';
import { getModuleSemesterData, getModuleTimetable } from 'utils/modules';

// Actions that should not be used directly outside of thunks
export const SET_TIMETABLES = 'SET_TIMETABLES' as const;
export const SET_TIMETABLE = 'SET_TIMETABLE' as const;
export const ADD_MODULE = 'ADD_MODULE' as const;
export const SET_HIDDEN_IMPORTED = 'SET_HIDDEN_IMPORTED' as const;
export const SET_TA_IMPORTED = 'SET_TA_IMPORTED' as const;
export const Internal = {
  setTimetables(lessons: TimetableConfig, taModules: TaModulesMap) {
    return {
      type: SET_TIMETABLES,
      payload: { lessons, taModules },
    };
  },

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
};

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

      const lessons = getModuleTimetable(module, semester);
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
export function modifyLesson(activeLesson: LessonWithIndex) {
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
  lessonIndices: LessonIndex[],
) {
  return {
    type: CHANGE_LESSON,
    payload: {
      semester,
      moduleCode,
      lessonType,
      lessonIndices,
    },
  };
}

export const ADD_LESSON = 'ADD_LESSON' as const;
export function addLesson(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonType: LessonType,
  lessonIndices: LessonIndex[],
) {
  return {
    type: ADD_LESSON,
    payload: {
      semester,
      moduleCode,
      lessonType,
      lessonIndices,
    },
  };
}

export const REMOVE_LESSON = 'REMOVE_LESSON' as const;
export function removeLesson(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonType: LessonType,
  lessonIndices: LessonIndex[],
) {
  return {
    type: REMOVE_LESSON,
    payload: {
      semester,
      moduleCode,
      lessonType,
      lessonIndices,
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
 * Valid non-TA modules must have one and only one classNo for each lesson type\
 * Valid TA modules configs must have lesson indices that belong to the correct lesson type
 * @param semester Semester of the timetable config to validate
 */
export function validateTimetable(semester: Semester) {
  return (dispatch: Dispatch, getState: GetState) => {
    const { timetables, moduleBank } = getState();

    const { lessons, ta, alreadyMigrated } = migrateTimetableConfigs(
      timetables.lessons as TimetableConfig | TimetableConfigV1,
      timetables.ta as TaModulesMap | TaModulesMapV1,
      moduleBank.modules,
    );

    if (!alreadyMigrated) dispatch(Internal.setTimetables(lessons, ta));

    // Extract the timetable and the modules for the semester
    const timetable = lessons[semester];
    if (!timetable) return;
    const taModules = ta[semester];

    // Check that all lessons for each module are valid. If they are not, we update it
    // such that they are
    each(timetable, (lessonConfig: ModuleLessonConfig, moduleCode: ModuleCode) => {
      const module = moduleBank.modules[moduleCode];
      if (!module) return;

      const isTa = taModules?.includes(moduleCode);

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
 * Adds a module to the semester's TA config
 * No changes are made to the lesson config as non-TA lesson configs are valid TA lesson config
 * @param semester
 * @param moduleCode
 * @returns
 */
export function addTaModule(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: ADD_TA_MODULE,
    payload: { semester, moduleCode },
  };
}

export const REMOVE_TA_MODULE = 'REMOVE_TA_MODULE' as const;
/**
 * A helper function for disableTaModule\
 * Removes a module from the semester's timetable TA modules list\
 * Does not check for the lessonConfig validity as a non-TA lesson config. Use disableTaModule instead.
 * @param semester
 * @param moduleCode
 * @param lessonConfig
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
 * Removes a module from the semester's timetable TA modules list and replaces the lesson config with the closest non-TA module lesson config\
 * The current lesson config is replaced with lessonConfig because TA lesson configs may not be valid non-TA lesson config
 * @param semester Semester of timetable to remove the TA module from
 * @param moduleCode Module code of the TA module to remove
 */
export function disableTaModule(semester: Semester, moduleCode: ModuleCode) {
  return (dispatch: Dispatch, getState: GetState) => {
    const { moduleBank, timetables } = getState();
    const module: Module = moduleBank.modules[moduleCode];
    const timetableLessonIndices = timetables.lessons[semester][moduleCode];

    const semesterData = getModuleSemesterData(module, semester);
    if (!semesterData) {
      dispatch(removeTaModule(semester, moduleCode, timetableLessonIndices));
      return;
    }
    const lessonIndicesMap = makeLessonIndicesMap(semesterData.timetable);
    const lessonConfig = getClosestLessonConfig(lessonIndicesMap, timetableLessonIndices);

    dispatch(removeTaModule(semester, moduleCode, lessonConfig));
  };
}
