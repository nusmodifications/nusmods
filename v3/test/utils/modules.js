import test from 'ava';
import _ from 'lodash';
import {
  modulePagePath,
  areLessonsSameClass,
  getModuleSemesterData,
} from 'utils/modules';

import cs1010s from '../mocks/modules/CS1010S.json';
import cs3216 from '../mocks/modules/CS3216.json';

const mockLesson = _.cloneDeep(cs1010s.History[0].Timetable[0]);
mockLesson.ModuleCode = 'CS1010S';
mockLesson.ModuleTitle = 'Programming Methodology';

test('modulePagePath should generate route correctly', (t) => {
  const actual = modulePagePath('CS1010S');
  const expected = '/modules/CS1010S';
  t.is(actual, expected);
});

test('getModuleSemesterData should return semester data if semester is present', (t) => {
  const sem = 1;
  const actual = getModuleSemesterData(cs3216, sem);
  const expected = {
    Semester: 1,
    Timetable: [
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1830',
        EndTime: '2030',
        Venue: 'VCRm',
      },
    ],
    LecturePeriods: ['Monday Evening'],
  };
  t.deepEqual(actual, expected);
});

test('getModuleSemesterData should return undefined if semester is absent', (t) => {
  const sem = 2;
  const actual = getModuleSemesterData(cs3216, sem);
  const expected = undefined;
  t.is(actual, expected);
});

function lessonWithDifferentProperty(lesson, property, newValue) {
  const anotherLesson = _.cloneDeep(lesson);
  anotherLesson[property] = newValue || 'TEST';
  return anotherLesson;
}

test('areLessonsSameClass should identify identity lessons as same class', (t) => {
  const deepClonedLesson = _.cloneDeep(mockLesson);
  t.true(areLessonsSameClass(mockLesson, deepClonedLesson));
});

test('areLessonsSameClass should identify lessons from the same ClassNo but with different timings as same class', (t) => {
  const otherLesson = lessonWithDifferentProperty(mockLesson, 'StartTime', '0000');
  const otherLesson2 = lessonWithDifferentProperty(otherLesson, 'EndTime', '2300');
  t.true(areLessonsSameClass(mockLesson, otherLesson2));
});

test('areLessonsSameClass should identify lessons with different ModuleCode as different class', (t) => {
  const otherLesson = lessonWithDifferentProperty(mockLesson, 'ModuleCode');
  t.false(areLessonsSameClass(mockLesson, otherLesson));
});

test('areLessonsSameClass should identify lessons with different ClassNo as different class', (t) => {
  const otherLesson = lessonWithDifferentProperty(mockLesson, 'ClassNo');
  t.false(areLessonsSameClass(mockLesson, otherLesson));
});

test('areLessonsSameClass should identify lessons with different LessonType as different class', (t) => {
  const otherLesson = lessonWithDifferentProperty(mockLesson, 'LessonType');
  t.false(areLessonsSameClass(mockLesson, otherLesson));
});
