export const ADD_MODULE = 'ADD_MODULE';
export function addModule(semester, moduleCode) {
  return {
    type: ADD_MODULE,
    payload: {
      semester,
      moduleCode,
    },
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
