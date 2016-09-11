import _ from 'lodash';

// Returns a flat array of lessons of a module for the corresponding semester.
export function getModuleTimetable(module, semester) {
  return _.get(_.find(module.History, (semData) => {
    return semData.Semester === semester;
  }), 'Timetable');
}

// Do these two lessons belong to the same class?
export function areLessonsSameClass(lesson1, lesson2) {
  return lesson1.ModuleCode === lesson2.ModuleCode &&
    lesson1.ClassNo === lesson2.ClassNo &&
    lesson1.LessonType === lesson2.LessonType;
}
