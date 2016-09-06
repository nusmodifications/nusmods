import _ from 'lodash';

import { ADD_MODULE, REMOVE_MODULE } from 'actions/timetables';

const defaultTimetableState = {}; // Map of semester to semesterTimetable.
const defaultSemesterTimetableState = {}; // Map of ModuleCode to timetable config for module.

function semesterTimetable(state = defaultSemesterTimetableState, action) {
  const moduleCode = action.payload.moduleCode;
  switch (action.type) {
    case ADD_MODULE:
      return Object.assign({}, state, {
        [moduleCode]: {},
      });
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
      return Object.assign({}, state, {
        [action.payload.semester]: semesterTimetable(state[action.payload.semester], action),
      });
    default:
      return state;
  }
}

export default timetables;
