import { AcadWeekInfo } from 'nusmoderator';
import {
  ModuleLessonConfig,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TimetableArrangement,
  TimetableDayArrangement,
  TimetableDayFormat,
} from 'types/timetables';
import { ClassNo, ColoredLesson, LessonType, ModuleCode, RawLesson, Semester } from 'types/modules';
import { ModulesMap } from 'reducers/moduleBank';

import _ from 'lodash';

import { getModuleSemesterData, getModuleTimetable } from 'utils/modules';

import { CS1010S, CS3216, PC1222, CS4243 } from '__mocks__/modules';
import modulesListJSON from '__mocks__/module-list.json';
import timetable from '__mocks__/sem-timetable.json';
import lessonsArray from '__mocks__/lessons-array.json';

import { createGenericColoredLesson, createGenericLesson } from 'test-utils/timetable';

import {
  areOtherClassesAvailable,
  arrangeLessonsForWeek,
  arrangeLessonsWithinDay,
  deserializeTimetable,
  doLessonsOverlap,
  findExamClashes,
  formatWeeks,
  getEndTimeAsDate,
  getStartTimeAsDate,
  groupLessonsByDay,
  hydrateSemTimetableWithLessons,
  isLessonAvailable,
  isLessonOngoing,
  isSameTimetableConfig,
  isValidSemester,
  lessonsForLessonType,
  randomModuleLessonConfig,
  serializeTimetable,
  timetableLessonsArray,
  validateModuleLessons,
  validateTimetableModules,
} from './timetables';

// TODO: Fix this later
const modulesList = modulesListJSON as any;

describe(isValidSemester, () => {
  test('semesters 1-4 are valid', () => {
    expect(isValidSemester(1)).toBe(true);
    expect(isValidSemester(2)).toBe(true);
    expect(isValidSemester(3)).toBe(true);
    expect(isValidSemester(4)).toBe(true);
  });

  test('non 1-4 are invalid', () => {
    expect(isValidSemester(0)).toBe(false);
    expect(isValidSemester(5)).toBe(false);
  });
});

test('randomModuleLessonConfig should return a random lesson config', () => {
  const sem: Semester = 1;
  const rawLessons: RawLesson[] = getModuleTimetable(CS1010S, sem);
  const lessonConfig: ModuleLessonConfig = randomModuleLessonConfig(rawLessons);
  Object.keys(lessonConfig).forEach((lessonType: LessonType) => {
    expect(lessonConfig[lessonType]).toBeTruthy();
  });
});

test('hydrateSemTimetableWithLessons should replace ClassNo with lessons', () => {
  const sem: Semester = 1;
  const moduleCode: ModuleCode = 'CS1010S';
  const modules: ModulesMap = {
    [moduleCode]: CS1010S,
  };
  const tutorialClassNo: ClassNo = '8';
  const recitationClassNo: ClassNo = '4';
  const lectureClassNo: ClassNo = '1';
  const config: SemTimetableConfig = {
    [moduleCode]: {
      Tutorial: '8',
      Recitation: '4',
      Lecture: '1',
    },
  };
  const configWithLessons: SemTimetableConfigWithLessons = hydrateSemTimetableWithLessons(
    config,
    modules,
    sem,
  );
  expect(configWithLessons[moduleCode].Tutorial[0].ClassNo).toBe(tutorialClassNo);
  expect(configWithLessons[moduleCode].Recitation[0].ClassNo).toBe(recitationClassNo);
  expect(configWithLessons[moduleCode].Lecture[0].ClassNo).toBe(lectureClassNo);
});

test('lessonsForLessonType should return all lessons belonging to a particular LessonType', () => {
  const sem: Semester = 1;
  const moduleTimetable: RawLesson[] = getModuleTimetable(CS1010S, sem);
  const lessonType: LessonType = 'Tutorial';
  const lessons: RawLesson[] = lessonsForLessonType(moduleTimetable, lessonType);
  expect(lessons.length > 0).toBe(true);
  lessons.forEach((lesson: RawLesson) => {
    expect(lesson.LessonType).toBe(lessonType);
  });
});

test('lessonsForLessonType should return empty array if no such LessonType is present', () => {
  const sem: Semester = 1;
  const moduleTimetable: RawLesson[] = getModuleTimetable(CS1010S, sem);
  const lessonType: LessonType = 'Dota Session';
  const lessons: RawLesson[] = lessonsForLessonType(moduleTimetable, lessonType);
  expect(lessons.length).toBe(0);
  expect(lessons).toEqual([]);
});

test('timetableLessonsArray should return a flat array of lessons', () => {
  const someTimetable = timetable;
  expect(timetableLessonsArray(someTimetable).length).toBe(6);
});

test('groupLessonsByDay should group lessons by DayText', () => {
  const lessons: ColoredLesson[] = lessonsArray;
  const lessonsGroupedByDay: TimetableDayFormat = groupLessonsByDay(lessons);
  expect(lessonsGroupedByDay.Monday.length).toBe(2);
  expect(lessonsGroupedByDay.Tuesday.length).toBe(1);
  expect(lessonsGroupedByDay.Wednesday.length).toBe(1);
  expect(lessonsGroupedByDay.Thursday.length).toBe(2);
});

test('doLessonsOverlap should correctly determine if two lessons overlap', () => {
  // Same day same time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Wednesday', '1000', '1200'),
    ),
  ).toBe(true);
  // Same day with no overlapping time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Wednesday', '1200', '1400'),
    ),
  ).toBe(false);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1200', '1400'),
      createGenericLesson('Wednesday', '1000', '1200'),
    ),
  ).toBe(false);
  // Same day with overlapping time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Wednesday', '1100', '1300'),
    ),
  ).toBe(true);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1100', '1300'),
      createGenericLesson('Wednesday', '1000', '1200'),
    ),
  ).toBe(true);
  // Same day with one lesson totally within another lesson.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Wednesday', '0900', '1300'),
    ),
  ).toBe(true);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '0900', '1300'),
      createGenericLesson('Wednesday', '1000', '1200'),
    ),
  ).toBe(true);
  // Different day same time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Thursday', '1000', '1200'),
    ),
  ).toBe(false);
  // Different day with no overlapping time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Thursday', '1200', '1400'),
    ),
  ).toBe(false);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1200', '1400'),
      createGenericLesson('Thursday', '1000', '1200'),
    ),
  ).toBe(false);
  // Different day with overlapping time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Thursday', '1100', '1300'),
    ),
  ).toBe(false);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1100', '1300'),
      createGenericLesson('Thursday', '1000', '1200'),
    ),
  ).toBe(false);
  // Different day with one lesson totally within another lesson.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Thursday', '0900', '1300'),
    ),
  ).toBe(false);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '0900', '1300'),
      createGenericLesson('Thursday', '1000', '1200'),
    ),
  ).toBe(false);
});

test('arrangeLessonsWithinDay', () => {
  // Empty array.
  const arrangement0: TimetableDayArrangement = arrangeLessonsWithinDay([]);
  expect(arrangement0.length).toBe(1);

  // Can fit within one row.
  const arrangement1: TimetableDayArrangement = arrangeLessonsWithinDay(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
    ]),
  );
  expect(arrangement1.length).toBe(1);

  // Two rows.
  const arrangement2: TimetableDayArrangement = arrangeLessonsWithinDay(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1500', '1700'),
    ]),
  );
  expect(arrangement2.length).toBe(2);

  // Three rows.
  const arrangement3: TimetableDayArrangement = arrangeLessonsWithinDay(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1100', '1300'),
      createGenericColoredLesson('Monday', '1000', '1300'),
    ]),
  );
  expect(arrangement3.length).toBe(3);
});

test('arrangeLessonsForWeek', () => {
  const arrangement0: TimetableArrangement = arrangeLessonsForWeek(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
    ]),
  );
  expect(arrangement0.Monday.length).toBe(1);

  const arrangement1: TimetableArrangement = arrangeLessonsForWeek(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
      createGenericColoredLesson('Tuesday', '1400', '1500'),
      createGenericColoredLesson('Tuesday', '1400', '1500'),
    ]),
  );
  expect(arrangement1.Monday.length).toBe(1);
  expect(arrangement1.Tuesday.length).toBe(2);

  const arrangement2: TimetableArrangement = arrangeLessonsForWeek(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
      createGenericColoredLesson('Tuesday', '1400', '1500'),
      createGenericColoredLesson('Tuesday', '1600', '1800'),
    ]),
  );
  expect(arrangement2.Monday.length).toBe(1);
  expect(arrangement2.Tuesday.length).toBe(1);

  const arrangement3: TimetableArrangement = arrangeLessonsForWeek(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Tuesday', '1100', '1300'),
      createGenericColoredLesson('Wednesday', '1000', '1300'),
    ]),
  );
  expect(arrangement3.Monday.length).toBe(1);
  expect(arrangement3.Tuesday.length).toBe(1);
  expect(arrangement3.Wednesday.length).toBe(1);

  const arrangement4: TimetableArrangement = arrangeLessonsForWeek(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Tuesday', '1100', '1300'),
      createGenericColoredLesson('Wednesday', '1000', '1300'),
    ]),
  );
  expect(arrangement4.Monday.length).toBe(1);
  expect(arrangement4.Tuesday.length).toBe(1);
  expect(arrangement4.Wednesday.length).toBe(1);

  const arrangement5: TimetableArrangement = arrangeLessonsForWeek(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Tuesday', '1100', '1300'),
      createGenericColoredLesson('Tuesday', '1200', '1400'),
      createGenericColoredLesson('Wednesday', '1000', '1300'),
      createGenericColoredLesson('Wednesday', '1100', '1400'),
    ]),
  );
  expect(arrangement5.Monday.length).toBe(1);
  expect(arrangement5.Tuesday.length).toBe(2);
  expect(arrangement5.Wednesday.length).toBe(2);
});

test('areOtherClassesAvailable', () => {
  // Lessons belong to different ClassNo.
  const lessons1: RawLesson[] = _.shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '2'),
    createGenericLesson('Monday', '1400', '1500', 'Lecture', '3'),
  ]);
  expect(areOtherClassesAvailable(lessons1, 'Lecture')).toBe(true);
  expect(areOtherClassesAvailable(lessons1, 'Tutorial')).toBe(false);

  // Lessons belong to the same ClassNo.
  const lessons2: RawLesson[] = _.shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Lecture', '1'),
  ]);
  expect(areOtherClassesAvailable(lessons2, 'Lecture')).toBe(false);

  // Lessons belong to different LessonType.
  const lessons3: RawLesson[] = _.shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Tutorial', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Tutorial', '2'),
  ]);
  expect(areOtherClassesAvailable(lessons3, 'Lecture')).toBe(false);
  expect(areOtherClassesAvailable(lessons3, 'Tutorial')).toBe(true);
});

test('findExamClashes should return non-empty object if exams clash', () => {
  const sem: Semester = 1;
  const examClashes = findExamClashes([CS1010S, CS4243 as any, CS3216], sem);
  const examDate = _.get(getModuleSemesterData(CS1010S, sem), 'ExamDate');
  if (!examDate) throw new Error('Cannot find ExamDate');
  expect(examClashes).toEqual({ [examDate]: [CS1010S, CS4243] });
});

test('findExamClashes should return empty object if exams do not clash', () => {
  const sem: Semester = 2;
  const examClashes = findExamClashes([CS1010S, PC1222, CS3216], sem);
  expect(examClashes).toEqual({});
});

test('timetable serialization/deserialization', () => {
  const configs: SemTimetableConfig[] = [
    {},
    { CS1010S: {} },
    {
      GER1000: { Tutorial: 'B01' },
    },
    {
      CS2104: { Lecture: '1', Tutorial: '2' },
      CS2105: { Lecture: '1', Tutorial: '1' },
      CS2107: { Lecture: '1', Tutorial: '8' },
      CS4212: { Lecture: '1', Tutorial: '1' },
      CS4243: { Laboratory: '2', Lecture: '1' },
      GER1000: { Tutorial: 'B01' },
    },
  ];

  configs.forEach((config) => {
    expect(deserializeTimetable(serializeTimetable(config))).toEqual(config);
  });
});

test('deserializing edge cases', () => {
  // Duplicate module code
  expect(deserializeTimetable('CS1010S=LEC:01&CS1010S=REC:11')).toEqual({
    CS1010S: {
      Lecture: '01',
      Recitation: '11',
    },
  });

  // No lessons
  expect(deserializeTimetable('CS1010S&CS3217&CS2105=LEC:1')).toEqual({
    CS1010S: {},
    CS3217: {},
    CS2105: {
      Lecture: '1',
    },
  });
});

test('isSameTimetableConfig', () => {
  // Empty timetable
  expect(isSameTimetableConfig({}, {})).toBe(true);

  // Change lessonType order
  expect(
    isSameTimetableConfig(
      { CS2104: { Tutorial: '1', Lecture: '2' } },
      { CS2104: { Lecture: '2', Tutorial: '1' } },
    ),
  ).toBe(true);

  // Change module order
  expect(
    isSameTimetableConfig(
      {
        CS2104: { Lecture: '1', Tutorial: '2' },
        CS2105: { Lecture: '1', Tutorial: '1' },
      },
      {
        CS2105: { Lecture: '1', Tutorial: '1' },
        CS2104: { Lecture: '1', Tutorial: '2' },
      },
    ),
  ).toBe(true);

  // Different values
  expect(
    isSameTimetableConfig(
      { CS2104: { Lecture: '1', Tutorial: '2' } },
      { CS2104: { Lecture: '2', Tutorial: '1' } },
    ),
  ).toBe(false);

  // One is subset of the other
  expect(
    isSameTimetableConfig(
      {
        CS2104: { Tutorial: '1', Lecture: '2' },
      },
      {
        CS2104: { Tutorial: '1', Lecture: '2' },
        CS2105: { Lecture: '1', Tutorial: '1' },
      },
    ),
  ).toBe(false);
});

describe(validateTimetableModules, () => {
  test('should leave valid modules untouched', () => {
    expect(validateTimetableModules({}, modulesList)).toEqual([{}, []]);
    expect(
      validateTimetableModules(
        {
          CS1010S: {},
          CS2100: {},
        },
        modulesList,
      ),
    ).toEqual([{ CS1010S: {}, CS2100: {} }, []]);
  });

  test('should remove invalid modules', () => {
    expect(
      validateTimetableModules(
        {
          DEADBEEF: {},
          CS2100: {},
        },
        modulesList,
      ),
    ).toEqual([{ CS2100: {} }, ['DEADBEEF']]);
  });
});

describe('validateModuleLessons', () => {
  const semester: Semester = 1;
  const lessons: ModuleLessonConfig = {
    Lecture: '1',
    Recitation: '10',
    Tutorial: '11',
  };

  test('should leave valid lessons untouched', () => {
    expect(validateModuleLessons(semester, lessons, CS1010S)).toEqual([lessons, []]);
  });

  test('should remove lesson types which do not exist', () => {
    expect(
      validateModuleLessons(
        semester,
        {
          ...lessons,
          Laboratory: '2', // CS1010S has no lab
        },
        CS1010S,
      ),
    ).toEqual([lessons, ['Laboratory']]);
  });

  test('should replace lessons with invalid class no', () => {
    expect(
      validateModuleLessons(
        semester,
        {
          ...lessons,
          Lecture: '2', // CS1010S has no Lecture 2
        },
        CS1010S,
      ),
    ).toEqual([lessons, ['Lecture']]);
  });

  test('should add lessons for when they are missing', () => {
    expect(
      validateModuleLessons(
        semester,
        {
          Tutorial: '10',
        },
        CS1010S,
      ),
    ).toEqual([
      {
        Lecture: '1',
        Recitation: '1',
        Tutorial: '10',
      },
      ['Lecture', 'Recitation'],
    ]);
  });
});

describe(formatWeeks, () => {
  it('should abbreviate consecutive week numbers', () => {
    expect(formatWeeks([1])).toEqual('Week 1');
    expect(formatWeeks([1, 2, 3, 4])).toEqual('Weeks 1-4');
    expect(formatWeeks([1, 2, 3, 4, 6, 7, 8, 9])).toEqual('Weeks 1-4, 6-9');
    expect(formatWeeks([1, 3, 5])).toEqual('Weeks 1, 3, 5');
    expect(formatWeeks([1, 2, 4, 5, 6, 7])).toEqual('Weeks 1, 2, 4-7');
    expect(formatWeeks([1, 2, 4, 5])).toEqual('Weeks 1, 2, 4, 5');
  });
});

describe(isLessonAvailable, () => {
  const weekInfo: AcadWeekInfo = {
    year: '2017-2018',
    sem: 'Semester 1',
    type: 'Instructional',
    num: 5,
  };

  test('should return false if the lesson is a tutorial and it is week 1 and 2', () => {
    const lesson = createGenericLesson('Monday', '0800', '1000', 'Tutorial');
    expect(
      isLessonAvailable(lesson, {
        ...weekInfo,
        num: 1,
      }),
    ).toBe(false);

    expect(
      isLessonAvailable(lesson, {
        ...weekInfo,
        num: 3,
      }),
    ).toBe(true);
  });

  test("should return false if the lesson's Weeks does not match the week number", () => {
    expect(
      isLessonAvailable(
        { ...createGenericLesson(), Weeks: [1, 3, 5, 7, 9, 11] },
        {
          ...weekInfo,
          num: 4,
        },
      ),
    ).toBe(false);

    expect(
      isLessonAvailable(
        { ...createGenericLesson(), Weeks: [1, 2, 3] },
        {
          ...weekInfo,
          num: 4,
        },
      ),
    ).toBe(false);

    expect(
      isLessonAvailable(
        { ...createGenericLesson(), Weeks: [1, 3, 5, 7, 9, 11] },
        {
          ...weekInfo,
          num: 5,
        },
      ),
    ).toBe(true);
  });
});

describe(isLessonOngoing, () => {
  test('should return whether a lesson is ongoing', () => {
    const lesson = createGenericLesson();
    expect(isLessonOngoing(lesson, 759)).toBe(false);
    expect(isLessonOngoing(lesson, 800)).toBe(true);
    expect(isLessonOngoing(lesson, 805)).toBe(true);
    expect(isLessonOngoing(lesson, 959)).toBe(true);
    expect(isLessonOngoing(lesson, 1000)).toBe(false);
  });
});

describe(getStartTimeAsDate, () => {
  test('should return start time as date', () => {
    const date = new Date(2018, 5, 10);
    const lesson = createGenericLesson('Monday', '0830', '1045');
    expect(getStartTimeAsDate(lesson, date)).toEqual(new Date(2018, 5, 10, 8, 30));
  });
});

describe(getEndTimeAsDate, () => {
  test('should return end time as date', () => {
    const date = new Date(2018, 5, 10);
    const lesson = createGenericLesson('Monday', '0830', '1045');
    expect(getEndTimeAsDate(lesson, date)).toEqual(new Date(2018, 5, 10, 10, 45));
  });
});
