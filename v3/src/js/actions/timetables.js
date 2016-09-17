import { loadModule } from 'actions/moduleBank';
import { randomLessonConfig } from 'utils/timetable';
import { getModuleTimetable } from 'utils/modules';

import type { FSA } from 'types/redux';
import type {
  ModuleCode,
  Semester,
  TimetableLesson,
} from 'types/modules';

export const ADD_MODULE: string = 'ADD_MODULE';
export function addModule(semester: Semester, moduleCode: ModuleCode) {
  return (dispatch, getState) => {
    return dispatch(loadModule(moduleCode)).then(() => {
      const module = getState().entities.moduleBank.modules[moduleCode];
      const lessons = getModuleTimetable(module, semester);
      const lessonsIncludingModuleCode = lessons.map((lesson: TimetableLesson) => {
        return {
          ...lesson,
          ModuleCode: moduleCode,
          ModuleTitle: module.ModuleTitle,
        };
      });
      return dispatch({
        type: ADD_MODULE,
        payload: {
          semester,
          moduleCode,
          moduleLessonConfig: randomLessonConfig(lessonsIncludingModuleCode),
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
export function modifyLesson(activeLesson: TimetableLesson): FSA {
  return {
    type: MODIFY_LESSON,
    payload: {
      activeLesson,
    },
  };
}

export const CHANGE_LESSON: string = 'CHANGE_LESSON';
export function changeLesson(semester: Semester, lesson: TimetableLesson): FSA {
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
  };
}
