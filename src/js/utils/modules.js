import _ from 'lodash';

// Returns semester specific details such as exam date and timetable.
export function getModuleHistory(module, semester) {
  return _.find(module.History, (semData) => {
    return semData.Semester === semester;
  });
}

// Returns a flat array of lessons of a module for the corresponding semester.
export function getModuleTimetable(module, semester) {
  return _.get(getModuleHistory(module, semester), 'Timetable');
}

// Do these two lessons belong to the same class?
export function areLessonsSameClass(lesson1, lesson2) {
  return lesson1.ModuleCode === lesson2.ModuleCode &&
    lesson1.ClassNo === lesson2.ClassNo &&
    lesson1.LessonType === lesson2.LessonType;
}
