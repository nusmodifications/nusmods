import { loadModule } from 'actions/moduleBank';
import { randomLessonConfig } from 'utils/timetable';
import { getModuleTimetable } from 'utils/modules';

export const ADD_MODULE = 'ADD_MODULE';
export function addModule(semester, moduleCode) {
  return (dispatch, getState) => {
    return dispatch(loadModule(moduleCode)).then(() => {
      const module = getState().entities.moduleBank.modules[moduleCode];
      const lessons = getModuleTimetable(module, semester);
      const lessonsIncludingModuleCode = lessons.map((lesson) => {
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

export const REMOVE_MODULE = 'REMOVE_MODULE';
export function removeModule(semester, moduleCode) {
  return {
    type: REMOVE_MODULE,
    payload: {
      semester,
      moduleCode,
    },
  };
}

export const MODIFY_LESSON = 'MODIFY_LESSON';
export function modifyLesson(activeLesson) {
  return {
    type: MODIFY_LESSON,
    payload: {
      activeLesson,
    },
  };
}

export const CHANGE_LESSON = 'CHANGE_LESSON';
export function changeLesson(semester, { ModuleCode, LessonType, ClassNo }) {
  return {
    type: CHANGE_LESSON,
    payload: {
      semester,
      moduleCode: ModuleCode,
      lessonType: LessonType,
      classNo: ClassNo,
    },
  };
}

export const CANCEL_MODIFY_LESSON = 'CANCEL_MODIFY_LESSON';
export function cancelModifyLesson() {
  return {
    type: CANCEL_MODIFY_LESSON,
  };
}
