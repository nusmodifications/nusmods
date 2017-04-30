// @flow
import type { ModuleLessonConfig } from 'types/timetables';
import type { FSA } from 'types/redux';
import type {
  Module,
  ModuleCode,
  Semester,
  RawLesson,
  Lesson,
} from 'types/modules';

import { loadModule } from 'actions/moduleBank';
import { randomModuleLessonConfig } from 'utils/timetables';
import { getModuleTimetable } from 'utils/modules';

export const ADD_MODULE: string = 'ADD_MODULE';
export function addModule(semester: Semester, moduleCode: ModuleCode) {
  return (dispatch: Function, getState: Function) => {
    return dispatch(loadModule(moduleCode)).then(() => {
      const module: Module = getState().entities.moduleBank.modules[moduleCode];
      const lessons: Array<RawLesson> = getModuleTimetable(module, semester);
      let moduleLessonConfig: ModuleLessonConfig = {};
      if (lessons) { // Module may not have lessons.
        moduleLessonConfig = randomModuleLessonConfig(lessons);
      }
      return dispatch({
        type: ADD_MODULE,
        payload: {
          semester,
          moduleCode,
          moduleLessonConfig,
        },
      });
    });
  };
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
