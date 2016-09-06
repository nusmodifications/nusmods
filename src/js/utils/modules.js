import _ from 'lodash';

// Returns a random configuration of a module's timetable lessons.
// Used when a module is first added.
export default function randomLessonConfiguration(lessons) {
  return _(lessons).groupBy('LessonType')
                    .mapValues((group) => {
                      return _.groupBy(group, 'ClassNo');
                    })
                    .mapValues((group) => {
                      return _.sample(group);
                    })
                    .value();
}
