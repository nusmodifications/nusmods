import { Semester, SemesterData } from 'types/modules';

import _ from 'lodash';
import {
  addAcadYear,
  areLessonsSameClass,
  formatExamDate,
  getExamDate,
  getFirstAvailableSemester,
  getFormattedExamDate,
  getModuleSemesterData,
  getYearsBetween,
  offsetAcadYear,
  renderMCs,
  subtractAcadYear,
  isGraduateModule,
  renderExamDuration,
  getExamDuration,
} from 'utils/modules';
import { noBreak } from 'utils/react';

import { EVERY_WEEK } from 'test-utils/timetable';
import { CS1010S, CS3216 } from '__mocks__/modules';
import { Lesson } from 'types/timetables';

const mockLesson = _.cloneDeep(CS1010S.semesterData[0].timetable[0]) as Lesson;
mockLesson.moduleCode = 'CS1010S';
mockLesson.title = 'Programming Methodology';

test('getModuleSemesterData should return semester data if semester is present', () => {
  const sem: Semester = 1;
  const actual = getModuleSemesterData(CS3216, sem);
  const expected = {
    semester: 1,
    timetable: [
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1830',
        endTime: '2030',
        venue: 'VCRm',
      },
    ],
  };
  expect(actual).toEqual(expected);
});

test('getModuleSemesterData should return undefined if semester is absent', () => {
  const sem: Semester = 2;
  const actual = getModuleSemesterData(CS3216, sem);
  expect(actual).toBe(undefined);
});

function lessonWithDifferentProperty(
  lesson: Lesson,
  property: keyof Lesson,
  newValue: any = 'TEST',
): Lesson {
  const anotherLesson: Lesson = _.cloneDeep(lesson);
  return { ...anotherLesson, [property]: newValue };
}

test('areLessonsSameClass should identify identity lessons as same class', () => {
  const deepClonedLesson: Lesson = _.cloneDeep(mockLesson);
  expect(areLessonsSameClass(mockLesson, deepClonedLesson)).toBe(true);
});

test(
  'areLessonsSameClass should identify lessons from the same ClassNo but ' +
    'with different timings as same class',
  () => {
    const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'startTime', '0000');
    const otherLesson2: Lesson = lessonWithDifferentProperty(otherLesson, 'endTime', '2300');
    expect(areLessonsSameClass(mockLesson, otherLesson2)).toBe(true);
  },
);

test('areLessonsSameClass should identify lessons with different ModuleCode as different class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'moduleCode');
  expect(areLessonsSameClass(mockLesson, otherLesson)).toBe(false);
});

test('areLessonsSameClass should identify lessons with different ClassNo as different class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'classNo');
  expect(areLessonsSameClass(mockLesson, otherLesson)).toBe(false);
});

test('areLessonsSameClass should identify lessons with different lessonType as different class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'lessonType');
  expect(areLessonsSameClass(mockLesson, otherLesson)).toBe(false);
});

test('formatExamDate should format an exam date string correctly', () => {
  expect(formatExamDate('2016-11-23T01:00:00.000Z')).toBe('23-Nov-2016 9:00 AM');
  expect(formatExamDate('2016-01-23T01:00:00.000Z')).toBe('23-Jan-2016 9:00 AM');
  expect(formatExamDate('2016-11-03T01:00:00.000Z')).toBe('03-Nov-2016 9:00 AM');
  expect(formatExamDate('2016-11-03T11:00:00.000Z')).toBe('03-Nov-2016 7:00 PM');
  expect(formatExamDate('2016-11-03T11:30:00.000Z')).toBe('03-Nov-2016 7:30 PM');
  expect(formatExamDate('2016-11-03T00:30:00.000Z')).toBe('03-Nov-2016 8:30 AM');
  expect(formatExamDate('2016-01-03T00:01:00.000Z')).toBe('03-Jan-2016 8:01 AM');
});

test('getExamDate should return the correct exam date if it exists', () => {
  expect(getExamDate(CS1010S, 1)).toBe('2017-11-29T17:00+0800');
  expect(getExamDate(CS3216, 2)).toBeFalsy();
});

test('getExamDuration should return the correct exam duration if it exists', () => {
  expect(getExamDuration(CS1010S, 1)).toBe(120);
  expect(getExamDuration(CS3216, 2)).toBe(null);
});

test('getFormattedModuleExamDate should return the correctly formatted exam timing if it exists', () => {
  const sem: Semester = 1;
  const examTime: string = getFormattedExamDate(CS1010S, sem);
  expect(examTime).toBe('29-Nov-2017 5:00 PM');
});

test('getModuleSemExamDate should return "No Exam" if it does not exist', () => {
  const sem1: Semester = 1;
  expect(getFormattedExamDate(CS3216, sem1)).toBe('No Exam');
});

describe(getFirstAvailableSemester, () => {
  function createSemesterData(semester: Semester): SemesterData {
    return {
      semester,
      timetable: [],
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

describe(renderMCs, () => {
  it.each<[string | number, string]>([
    // Plural
    [0, '0 MCs'],
    ['0', '0 MCs'],
    [5, '5 MCs'],
    ['5', '5 MCs'],
    ['0.5', '0.5 MCs'],

    // Singular
    [1, '1 MC'],
    ['1', '1 MC'],
  ])('%s to equal %s', (mc, expected) => expect(renderMCs(mc)).toEqual(noBreak(expected)));
});

describe(renderExamDuration, () => {
  it.each<[number, string]>([
    [45, '45 mins'],
    [60, '1 hr'],
    [90, '1.5 hrs'],
    [70, '70 mins'],
    [120, '2 hrs'],
    [180, '3 hrs'],
  ])('%s to equal %s', (duration, expected) =>
    expect(renderExamDuration(duration)).toEqual(noBreak(expected)),
  );
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

describe(isGraduateModule, () => {
  it('should return true for graduate modules', () => {
    expect(isGraduateModule({ moduleCode: 'CS5012' })).toEqual(true);
    expect(isGraduateModule({ moduleCode: 'CS6000' })).toEqual(true);
    expect(isGraduateModule({ moduleCode: 'ACC5555X' })).toEqual(true);
  });

  it('should return false for undergrad modules', () => {
    expect(isGraduateModule({ moduleCode: 'CS1232' })).toEqual(false);
    expect(isGraduateModule({ moduleCode: 'CS4999' })).toEqual(false);
    expect(isGraduateModule({ moduleCode: 'CS3567' })).toEqual(false);
    expect(isGraduateModule({ moduleCode: 'CS1567D' })).toEqual(false);
    expect(isGraduateModule({ moduleCode: 'ACC4999X' })).toEqual(false);
  });
});
