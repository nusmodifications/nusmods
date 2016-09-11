import _ from 'lodash';

import { loadModule } from 'actions/moduleBank';
import { randomLessonConfig } from 'utils/timetable';

export const ADD_MODULE = 'ADD_MODULE';
export function addModule(semester, moduleCode) {
  return (dispatch, getState) => {
    return dispatch(loadModule(moduleCode)).then(() => {
      const module = getState().entities.moduleBank.modules[moduleCode];
      const lessons = _.find(module.History, (semData) => {
        return semData.Semester === semester;
      }).Timetable;
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

export const CANCEL_MODIFY_LESSON = 'CANCEL_MODIFY_LESSON';
export function cancelModifyLesson() {
  return {
    type: CANCEL_MODIFY_LESSON,
  };
}
