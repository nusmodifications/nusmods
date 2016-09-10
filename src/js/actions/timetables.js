import _ from 'lodash';

import { loadModule } from 'actions/moduleBank';
import { randomLessonConfig } from 'utils/modules';

export const ADD_MODULE = 'ADD_MODULE';
export function addModule(semester, moduleCode) {
  return (dispatch, getState) => {
    return dispatch(loadModule(moduleCode)).then(() => {
      const module = getState().entities.moduleBank.modules[moduleCode];
      const lessons = _.find(module.History, (semData) => {
        return semData.Semester === semester;
      }).Timetable;
      const lessonsIncludingModuleCode = lessons.map((lesson) => {
        return { ModuleCode: moduleCode, ...lesson };
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
