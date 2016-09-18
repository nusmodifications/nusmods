import test from 'ava';
import _ from 'lodash';
import {
  modulePagePath,
  areLessonsSameClass,
  getModuleSemesterData,
} from 'utils/modules';
import mockLesson from './mockLesson.json';
import mockModule from './mockModule.json';

test('modulePagePath should generate route correctly', (t) => {
  const actual = modulePagePath('MOD101');
  const expected = '/modules/MOD101';
  t.is(actual, expected);
});

test('areLessonsSameClass should identify same class', (t) => {
  const deepCloneMockLesson = _.clone(mockLesson, true);
  t.true(areLessonsSameClass(mockLesson, deepCloneMockLesson));
});

test('getModuleSemesterData should return array of lessons', (t) => {
  const actual = getModuleSemesterData(mockModule, 1);
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

test('getModuleSemesterData should return empty array', (t) => {
  // not sure if actual should be undefined
  const actual = getModuleSemesterData(mockModule, 2);
  const expected = null;
  t.is(actual, expected);
});

function testDifferentProperties(t, property) {
  const anotherMockLesson = _.clone(mockLesson, true);
  anotherMockLesson[property] = 'TEST';
  t.false(areLessonsSameClass(mockLesson, anotherMockLesson));
}

test('areLessonsSameClass should identify different ModuleCode', (t) => {
  testDifferentProperties(t, 'ModuleCode');
});

test('areLessonsSameClass should identify different ClassNo', (t) => {
  testDifferentProperties(t, 'ClassNo');
});

test('areLessonsSameClass should identify different LessonType', (t) => {
  testDifferentProperties(t, 'LessonType');
});
