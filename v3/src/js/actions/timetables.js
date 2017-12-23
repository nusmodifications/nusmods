// @flow
import { flatMap, isEmpty } from 'lodash';

import type { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import type { FSA } from 'types/redux';
import type { ColorMapping, ColorIndex } from 'types/reducers';
import type {
  Module,
  ModuleCode,
  Semester,
  Lesson,
} from 'types/modules';

import { fetchModule } from 'actions/moduleBank';
import { randomModuleLessonConfig } from 'utils/timetables';
import { getModuleTimetable } from 'utils/modules';

export const ADD_MODULE: string = 'ADD_MODULE';
export function addModule(
  semester: Semester,
  moduleCode: ModuleCode,
  lessonConfig: ModuleLessonConfig = {},
  colorIndex?: ColorIndex,
) {
  return (dispatch: Function, getState: Function) =>
    dispatch(fetchModule(moduleCode)).then(() => {
      const module: Module = getState().moduleBank.modules[moduleCode];
      const lessons = getModuleTimetable(module, semester);
      const moduleLessonConfig = lessons && isEmpty(lessonConfig) ?
        randomModuleLessonConfig(lessons) : lessonConfig;

      return dispatch({
        type: ADD_MODULE,
        payload: {
          semester,
          moduleCode,
          moduleLessonConfig,
          colorIndex,
        },
      });
    });
}

export const REMOVE_MODULE: string = 'REMOVE_MODULE';
export function removeModule(semester: Semester, moduleCode: ModuleCode): FSA {
  return {
    type: REMOVE_MODULE,
    payload: {
      semester,
      moduleCode,
    },
  };
}

export const MODIFY_LESSON: string = 'MODIFY_LESSON';
export function modifyLesson(activeLesson: Lesson): FSA {
  return {
    type: MODIFY_LESSON,
    payload: {
      activeLesson,
    },
  };
}

export const CHANGE_LESSON: string = 'CHANGE_LESSON';
export function changeLesson(semester: Semester, lesson: Lesson): FSA {
  return {
    type: CHANGE_LESSON,
    payload: {
      semester,
      moduleCode: lesson.ModuleCode,
      lessonType: lesson.LessonType,
      classNo: lesson.ClassNo,
    },
  };
}

export const CANCEL_MODIFY_LESSON: string = 'CANCEL_MODIFY_LESSON';
export function cancelModifyLesson(): FSA {
  return {
    type: CANCEL_MODIFY_LESSON,
    payload: null,
  };
}

export const SET_LESSON_CONFIG = 'SET_LESSON_CONFIG';
export function setLessonConfig(semester: Semester, config: ModuleLessonConfig): FSA {
  return {
    type: SET_LESSON_CONFIG,
    payload: { semester, config },
  };
}

export const SET_TIMETABLE = 'SET_TIMETABLE';
export function setTimetable(
  semester: Semester,
  timetable?: SemTimetableConfig,
  colors?: ColorMapping,
): FSA {
  return {
    type: SET_TIMETABLE,
    payload: { semester, timetable, colors },
  };
}

export function fetchTimetableModules(timetables: SemTimetableConfig[]) {
  return (dispatch: Function) => {
    const moduleCodes = new Set(flatMap(timetables, Object.keys));
    return Promise.all(Array.from(moduleCodes)
      .map(moduleCode => dispatch(fetchModule(moduleCode))));
  };
}
