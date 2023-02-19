import { each, flatMap } from 'lodash';

import type { Lesson, ColorIndex, ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import type { Dispatch, GetState } from 'types/redux';
import type { ColorMapping } from 'types/reducers';
import type { ClassNo, LessonType, Module, ModuleCode, Semester } from 'types/modules';

import { fetchModule } from 'actions/moduleBank';
import { openNotification } from 'actions/app';
import { getModuleCondensed } from 'selectors/moduleBank';
import {
  randomModuleLessonConfig,
  validateModuleLessons,
  validateTimetableModules,
} from 'utils/timetables';
import { getModuleTimetable } from 'utils/modules';

// Actions that should not be used directly outside of thunks
export const SET_TIMETABLE = 'SET_TIMETABLE' as const;
export const ADD_MODULE = 'ADD_MODULE' as const;
export const Internal = {
  setTimetable(
    semester: Semester,
    timetable: SemTimetableConfig | undefined,
    colors?: ColorMapping,
  ) {
    return {
      type: SET_TIMETABLE,
      payload: { semester, timetable, colors },
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

export const MODIFY_LESSON = 'MODIFY_LESSON' as const;
export function modifyLesson(activeLesson: Lesson) {
  return {
    type: MODIFY_LESSON,
    payload: {
      activeLesson,
    },
  };
}


export const CUSTOMISE_MODULE = 'CUSTOMISE_LESSON' as const;
export function customiseLesson(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: CUSTOMISE_MODULE,
    payload: {
      semester,
      moduleCode,
    },
  };
}

export const CHANGE_LESSON = 'CHANGE_LESSON' as const;
export function setLesson(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonType: LessonType,
  classNo: ClassNo,
) {
  return {
    type: CHANGE_LESSON,
    payload: {
      semester,
      moduleCode,
      lessonType,
      classNo,
    },
  };
}

export const ADD_CUSTOM_MODULE = 'ADD_CUSTOM_MODULE' as const;
export function addCustomModule(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: ADD_CUSTOM_MODULE,
    payload: {
      semester,
      moduleCode,
    },
  };
}

export const REMOVE_CUSTOM_MODULE = 'REMOVE_CUSTOM_MODULE' as const;
export function removeCustomModule(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: REMOVE_CUSTOM_MODULE,
    payload: {
      semester,
      moduleCode,
    },
  };
}

export const ADD_LESSON = 'ADD_LESSON' as const;
export function addLesson(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonType: LessonType,
  classNo: ClassNo,
) {
  return {
    type: ADD_LESSON,
    payload: {
      semester,
      moduleCode,
      lessonType,
      classNo,
    },
  };
}

export const REMOVE_LESSON = 'REMOVE_LESSON' as const;
export function removeLesson(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonType: LessonType,
  classNo: ClassNo,
) {
  return {
    type: REMOVE_LESSON,
    payload: {
      semester,
      moduleCode,
      lessonType,
      classNo,
    },
  };
}

export function changeLesson(semester: Semester, lesson: Lesson) {
  return setLesson(semester, lesson.moduleCode, lesson.lessonType, lesson.classNo);
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

    return dispatch(Internal.setTimetable(semester, validatedTimetable, colors));
  };
}

export function validateTimetable(semester: Semester) {
  return (dispatch: Dispatch, getState: GetState) => {
    const { timetables, moduleBank } = getState();

    // Extract the timetable and the modules for the semester
    const timetable = timetables.lessons[semester];
    if (!timetable) return;

    // Check that all lessons for each module are valid. If they are not, we update it
    // such that they are
    each(timetable, (lessonConfig: ModuleLessonConfig, moduleCode: ModuleCode) => {
      const module = moduleBank.modules[moduleCode];
      if (!module) return;

      const [validatedLessonConfig, changedLessonTypes] = validateModuleLessons(
        semester,
        lessonConfig,
        module,
      );

      if (changedLessonTypes.length) {
        dispatch(setLessonConfig(semester, moduleCode, validatedLessonConfig));
      }
    });
  };
}

export function fetchTimetableModules(timetables: SemTimetableConfig[]) {
  return (dispatch: Dispatch, getState: GetState) => {
    const moduleCodes = new Set(flatMap(timetables, Object.keys));
    const validateModule = getModuleCondensed(getState());

    return Promise.all(
      Array.from(moduleCodes)
        .filter(validateModule)
        .map((moduleCode) => dispatch(fetchModule(moduleCode))),
    );
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
