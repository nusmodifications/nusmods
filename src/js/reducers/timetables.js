import _ from 'lodash';

import { ADD_MODULE, REMOVE_MODULE } from 'actions/timetables';
import randomLessonConfiguration from 'utils/modules';

const defaultTimetableState = {}; // Map of semester to semesterTimetable.
const defaultSemesterTimetableState = {}; // Map of ModuleCode to timetable config for module.

function semesterTimetable(state = defaultSemesterTimetableState, action, entities) {
  const moduleCode = action.payload.moduleCode;
  const semester = action.payload.semester;
  switch (action.type) {
    case ADD_MODULE:
      return (() => {
        const module = entities.moduleBank.modules[moduleCode];
        const lessons = _.find(module.History, (semData) => {
          return semData.Semester === semester;
        }).Timetable;
        const lessonsInjectModuleCode = lessons.map((lesson) => {
          return Object.assign({}, {
            ModuleCode: moduleCode,
          }, lesson);
        });
        return Object.assign({}, state, {
          [moduleCode]: randomLessonConfiguration(lessonsInjectModuleCode),
        });
      })();
    case REMOVE_MODULE:
      return _.omit(state, moduleCode);
    default:
      return state;
  }
}

function timetables(state = defaultTimetableState, action, entities) {
  switch (action.type) {
    case ADD_MODULE:
    case REMOVE_MODULE:
      return Object.assign({}, state, {
        [action.payload.semester]: semesterTimetable(state[action.payload.semester], action,
                                                      entities),
      });
    default:
      return state;
  }
}

export default timetables;
