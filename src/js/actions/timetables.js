import { loadModule } from 'actions/moduleBank';

export const ADD_MODULE = 'ADD_MODULE';
export function addModule(semester, moduleCode) {
  return (dispatch) => {
    return dispatch(loadModule(moduleCode)).then(() => {
      return dispatch({
        type: ADD_MODULE,
        payload: {
          semester,
          moduleCode,
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
