import { each, flatMap } from 'lodash';

import { Lesson, ColorIndex, ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import { GetState } from 'types/redux';
import { ColorMapping } from 'types/reducers';
import { ClassNo, LessonType, Module, ModuleCode, Semester } from 'types/modules';

import { fetchModule } from 'actions/moduleBank';
import { openNotification } from 'actions/app';
import { getModuleCondensed } from 'selectors/moduleBank';
import {
  randomModuleLessonConfig,
  validateModuleLessons,
  validateTimetableModules,
} from 'utils/timetables';
import { getModuleTimetable } from 'utils/modules';

export const ADD_MODULE = 'ADD_MODULE';
export function addModule(semester: Semester, moduleCode: ModuleCode) {
  return (dispatch: Function, getState: GetState) =>
    dispatch(fetchModule(moduleCode)).then(() => {
      const module: Module = getState().moduleBank.modules[moduleCode];

      if (!module) {
        dispatch(
          openNotification(`Cannot load ${moduleCode}`, {
            action: {
              text: 'Retry',
              handler: () => dispatch(addModule(semester, moduleCode)),
            },
          }),
        );

        return;
      }

      const lessons = getModuleTimetable(module, semester);
      const moduleLessonConfig = randomModuleLessonConfig(lessons);

      dispatch({
        type: ADD_MODULE,
        payload: {
          semester,
          moduleCode,
          moduleLessonConfig,
        },
      });
    });
}

export const REMOVE_MODULE = 'REMOVE_MODULE';
export function removeModule(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: REMOVE_MODULE,
    payload: {
      semester,
      moduleCode,
    },
  };
}

export const MODIFY_LESSON = 'MODIFY_LESSON';
export function modifyLesson(activeLesson: Lesson) {
  return {
    type: MODIFY_LESSON,
    payload: {
      activeLesson,
    },
  };
}

export const CHANGE_LESSON = 'CHANGE_LESSON';
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

export function changeLesson(semester: Semester, lesson: Lesson) {
  return setLesson(semester, lesson.moduleCode, lesson.lessonType, lesson.classNo);
}

export const SET_LESSON_CONFIG = 'SET_LESSON_CONFIG';
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

export const CANCEL_MODIFY_LESSON = 'CANCEL_MODIFY_LESSON';
export function cancelModifyLesson() {
  return {
    type: CANCEL_MODIFY_LESSON,
    payload: null,
  };
}

export const SET_TIMETABLE = 'SET_TIMETABLE';
export function setTimetable(
  semester: Semester,
  timetable?: SemTimetableConfig,
  colors?: ColorMapping,
) {
  return (dispatch: Function, getState: GetState) => {
    let validatedTimetable = timetable;
    if (timetable) {
      [validatedTimetable] = validateTimetableModules(timetable, getState().moduleBank.moduleCodes);
    }

    return dispatch({
      type: SET_TIMETABLE,
      payload: { semester, timetable: validatedTimetable, colors },
    });
  };
}

export function validateTimetable(semester: Semester) {
  return (dispatch: Function, getState: GetState) => {
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
  return (dispatch: Function, getState: GetState) => {
    const moduleCodes = new Set(flatMap(timetables, Object.keys));
    const validateModule = getModuleCondensed(getState().moduleBank);

    return Promise.all(
      Array.from(moduleCodes)
        .filter(validateModule)
        .map((moduleCode) => dispatch(fetchModule(moduleCode))),
    );
  };
}

export const SELECT_MODULE_COLOR = 'SELECT_MODULE_COLOR';
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

export const HIDE_LESSON_IN_TIMETABLE = 'HIDE_LESSON_IN_TIMETABLE';
export function hideLessonInTimetable(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: HIDE_LESSON_IN_TIMETABLE,
    payload: { moduleCode, semester },
  };
}

export const SHOW_LESSON_IN_TIMETABLE = 'SHOW_LESSON_IN_TIMETABLE';
export function showLessonInTimetable(semester: Semester, moduleCode: ModuleCode) {
  return {
    type: SHOW_LESSON_IN_TIMETABLE,
    payload: { moduleCode, semester },
  };
}
