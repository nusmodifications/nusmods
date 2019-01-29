// @flow

import type { Semester, SemesterData, Lesson } from 'types/modules';

import _ from 'lodash';
import {
  getModuleSemesterData,
  areLessonsSameClass,
  formatExamDate,
  getModuleExamDate,
  getFormattedModuleExamDate,
  getFirstAvailableSemester,
  parseWorkload,
  renderMCs,
  subtractAcadYear,
  addAcadYear,
  getYearsBetween,
  offsetAcadYear,
} from 'utils/modules';
import { noBreak } from 'utils/react';

/** @var {Module} */
import cs1010s from '__mocks__/modules/CS1010S.json';
/** @var {Module} */
import cs3216 from '__mocks__/modules/CS3216.json';

const mockLesson: Lesson = _.cloneDeep(cs1010s.History[0].Timetable[0]);
mockLesson.ModuleCode = 'CS1010S';
mockLesson.ModuleTitle = 'Programming Methodology';

test('getModuleSemesterData should return semester data if semester is present', () => {
  const sem: Semester = 1;
  const actual: ?SemesterData = getModuleSemesterData(cs3216, sem);
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
  expect(actual).toEqual(expected);
});

test('getModuleSemesterData should return undefined if semester is absent', () => {
  const sem: Semester = 2;
  const actual: ?SemesterData = getModuleSemesterData(cs3216, sem);
  expect(actual).toBe(undefined);
});

function lessonWithDifferentProperty(lesson: Lesson, property: string, newValue: any): Lesson {
  const anotherLesson: Lesson = _.cloneDeep(lesson);
  anotherLesson[property] = newValue || 'TEST';
  return anotherLesson;
}

test('areLessonsSameClass should identify identity lessons as same class', () => {
  const deepClonedLesson: Lesson = _.cloneDeep(mockLesson);
  expect(areLessonsSameClass(mockLesson, deepClonedLesson)).toBe(true);
});

test(
  'areLessonsSameClass should identify lessons from the same ClassNo but ' +
    'with different timings as same class',
  () => {
    const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'StartTime', '0000');
    const otherLesson2: Lesson = lessonWithDifferentProperty(otherLesson, 'EndTime', '2300');
    expect(areLessonsSameClass(mockLesson, otherLesson2)).toBe(true);
  },
);

test('areLessonsSameClass should identify lessons with different ModuleCode as different class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'ModuleCode');
  expect(areLessonsSameClass(mockLesson, otherLesson)).toBe(false);
});

test('areLessonsSameClass should identify lessons with different ClassNo as different class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'ClassNo');
  expect(areLessonsSameClass(mockLesson, otherLesson)).toBe(false);
});

test('areLessonsSameClass should identify lessons with different LessonType as different class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'LessonType');
  expect(areLessonsSameClass(mockLesson, otherLesson)).toBe(false);
});

test('formatExamDate should format an exam date string correctly', () => {
  expect(formatExamDate('2016-11-23T09:00+0800')).toBe('23-11-2016 9:00 AM');
  expect(formatExamDate('2016-01-23T09:00+0800')).toBe('23-01-2016 9:00 AM');
  expect(formatExamDate('2016-11-03T09:00+0800')).toBe('03-11-2016 9:00 AM');
  expect(formatExamDate('2016-11-03T19:00+0800')).toBe('03-11-2016 7:00 PM');
  expect(formatExamDate('2016-11-03T19:30+0800')).toBe('03-11-2016 7:30 PM');
  expect(formatExamDate('2016-11-03T08:30+0800')).toBe('03-11-2016 8:30 AM');
  expect(formatExamDate('2016-01-03T08:01+0800')).toBe('03-01-2016 8:01 AM');
});

test('getModuleExamDate should return the correct exam date if it exists', () => {
  expect(getModuleExamDate(cs1010s, 1)).toBe('2017-11-29T17:00+0800');
  expect(getModuleExamDate(cs3216, 2)).toBeFalsy();
});

test('getFormattedModuleExamDate should return the correctly formatted exam timing if it exists', () => {
  const sem: Semester = 1;
  const examTime: string = getFormattedModuleExamDate(cs1010s, sem);
  expect(examTime).toBe('29-11-2017 5:00 PM');
});

test('getModuleSemExamDate should return "No Exam" if it does not exist', () => {
  const sem1: Semester = 1;
  expect(getFormattedModuleExamDate(cs3216, sem1)).toBe('No Exam');
});

describe('getFirstAvailableSemester', () => {
  function createSemesterData(semester: Semester): SemesterData {
    return {
      Semester: semester,
      LecturePeriods: [],
      Timetable: [],
    };
  }

  const sem1Data = createSemesterData(1);
  const sem2Data = createSemesterData(2);
  const sem3Data = createSemesterData(3);

  test('should return the current semester if it is available', () => {
    expect(getFirstAvailableSemester([sem1Data], 1)).toEqual(1);
    expect(getFirstAvailableSemester([sem2Data, sem3Data, sem1Data], 1)).toEqual(1);

    expect(getFirstAvailableSemester([sem2Data], 2)).toEqual(2);
    expect(getFirstAvailableSemester([sem1Data, sem2Data, sem3Data], 2)).toEqual(2);
  });

  test('should return the first semester if the current semester is not available', () => {
    expect(getFirstAvailableSemester([sem3Data], 1)).toEqual(3);
    expect(getFirstAvailableSemester([sem2Data], 1)).toEqual(2);
    expect(getFirstAvailableSemester([sem3Data, sem2Data], 1)).toEqual(2);

    expect(getFirstAvailableSemester([sem1Data], 3)).toEqual(1);
    expect(getFirstAvailableSemester([sem2Data], 3)).toEqual(2);
    expect(getFirstAvailableSemester([sem2Data, sem1Data], 3)).toEqual(1);
  });
});

test('parseWorkload should break workload down to components', () => {
  expect(parseWorkload(cs3216.Workload)).toEqual({
    Lecture: 2,
    Tutorial: 1,
    Project: 8,
    Preparation: 2,
  });

  expect(parseWorkload(cs1010s.Workload)).toEqual({
    Lecture: 2,
    Tutorial: 1,
    Laboratory: 1,
    Project: 3,
    Preparation: 3,
  });
});

test('parseWorkload should parse decimal workloads', () => {
  expect(parseWorkload('2.5-0.5-0-3-4')).toEqual({
    Lecture: 2.5,
    Tutorial: 0.5,
    Project: 3,
    Preparation: 4,
  });

  expect(parseWorkload('0-1-0-0-0.25')).toEqual({
    Tutorial: 1,
    Preparation: 0.25,
  });

  expect(parseWorkload('0.0-0.0-0.0-20.0-0.0')).toEqual({
    Project: 20,
  });
});

test('parseWorkload should handle unusual workload strings', () => {
  // Extract all workload strings using jq
  // cat moduleInformation.json | jq '.[] | [.ModuleCode, .Workload] | join(": ")'

  // HY5660 / HY6660
  expect(parseWorkload('NA-NA-NA-NA-10')).toEqual({
    Preparation: 10,
  });

  // MKT3402A/B
  expect(parseWorkload('3-0-0-5-3 (tentative)')).toEqual({
    Lecture: 3,
    Project: 5,
    Preparation: 3,
  });

  expect(parseWorkload('3(sectional)-0-0-4-3')).toEqual({
    Lecture: 3,
    Project: 4,
    Preparation: 3,
  });
});

test('parseWorkload should return input string as is if it cannot be parsed', () => {
  const invalidInputs = [
    '',
    '\n',
    '2-2-2-2-3-4', // CE1101 (six components)
    '2-4-5-4', // CE1102 (four components)
    'approximately 120 hours of independent study and research and consultation with a NUS lecturer.',
    'Varies depending on individual student with their supervisor',
    '16 weeks of industrial attachment',
    'See remarks',
    'Lectures: 450 hours, Clinics: 3150 hours, Seminars/Tutorial: 450 hours,Technique/Practical: 450 hou',
  ];

  invalidInputs.forEach((input) => {
    expect(parseWorkload(input)).toEqual(input);
  });
});

describe(renderMCs, () => {
  it.each([
    // Plural
    [0, '0 MCs'],
    ['0', '0 MCs'],
    [5, '5 MCs'],
    ['5', '5 MCs'],

    // Singular
    [1, '1 MC'],
    ['1', '1 MC'],
  ])('%s to equal %s', (mc, expected) => expect(renderMCs(mc)).toEqual(noBreak(expected)));
});

describe(subtractAcadYear, () => {
  test('should subtract acad years', () => {
    expect(subtractAcadYear('2018/2019')).toEqual('2017/2018');
    expect(subtractAcadYear('2015/2016')).toEqual('2014/2015');
  });
});

describe(addAcadYear, () => {
  test('should add acad years', () => {
    expect(addAcadYear('2018/2019')).toEqual('2019/2020');
    expect(addAcadYear('2015/2016')).toEqual('2016/2017');
  });
});

describe(getYearsBetween, () => {
  test('should get years between min and maxYear', () => {
    expect(getYearsBetween('2018/2019', '2018/2019')).toEqual(['2018/2019']);
    expect(getYearsBetween('2014/2015', '2018/2019')).toEqual([
      '2014/2015',
      '2015/2016',
      '2016/2017',
      '2017/2018',
      '2018/2019',
    ]);
  });

  test('should throw if min year is less than max year', () => {
    expect(() => getYearsBetween('2016/2017', '2014/2015')).toThrow();
  });
});

describe(offsetAcadYear, () => {
  test('should return year unchanged if offset is zero', () => {
    expect(offsetAcadYear('2018/2019', 0)).toEqual('2018/2019');
  });

  test('should work with negative offsets', () => {
    expect(offsetAcadYear('2018/2019', -1)).toEqual('2017/2018');
    expect(offsetAcadYear('2018/2019', -4)).toEqual('2014/2015');
  });

  test('should work with positive offsets', () => {
    expect(offsetAcadYear('2018/2019', 1)).toEqual('2019/2020');
    expect(offsetAcadYear('2018/2019', 4)).toEqual('2022/2023');
  });
});
