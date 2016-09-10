import _ from 'lodash';

import { ADD_MODULE, REMOVE_MODULE } from 'actions/timetables';
import storage from 'storage';

// Map of semester to semesterTimetable.
// TODO: Extract timetable retrieval and persistance logic.
const defaultTimetableState = storage.getTimetable();

// Map of ModuleCode to timetable config for module.
const defaultSemesterTimetableState = {};

function semesterTimetable(state = defaultSemesterTimetableState, action) {
  const moduleCode = action.payload.moduleCode;
  switch (action.type) {
    case ADD_MODULE:
      return {
        ...state,
        [moduleCode]: action.payload.moduleLessonConfig,
      };
    case REMOVE_MODULE:
      return _.omit(state, moduleCode);
    default:
      return state;
  }
}

function timetables(state = defaultTimetableState, action) {
  switch (action.type) {
    case ADD_MODULE:
    case REMOVE_MODULE:
      return (() => {
        const newState = {
          ...state,
          [action.payload.semester]: semesterTimetable(state[action.payload.semester], action),
        };
        storage.setTimetable(newState);
        return newState;
      })();
    default:
      return state;
  }
}

export default timetables;
