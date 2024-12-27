import NUSModerator from 'nusmoderator';
import _ from 'lodash';
import { parseISO } from 'date-fns';
import {
  ColoredLesson,
  ModuleLessonConfig,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TaModulesConfig,
  TimetableArrangement,
  TimetableDayArrangement,
  TimetableDayFormat,
} from 'types/timetables';
import { LessonType, RawLesson, Semester, Weeks } from 'types/modules';
import { ModulesMap } from 'types/reducers';

import { getModuleSemesterData, getModuleTimetable } from 'utils/modules';

import { CS1010S, CS3216, CS4243, PC1222, CS1010A } from '__mocks__/modules';
import moduleCodeMapJSON from '__mocks__/module-code-map.json';
import timetable from '__mocks__/sem-timetable.json';
import lessonsArray from '__mocks__/lessons-array.json';

import {
  createGenericColoredLesson,
  createGenericLesson,
  EVEN_WEEK,
  EVERY_WEEK,
  ODD_WEEK,
} from 'test-utils/timetable';

import {
  areOtherClassesAvailable,
  arrangeLessonsForWeek,
  arrangeLessonsWithinDay,
  deserializeTimetable,
  doLessonsOverlap,
  findExamClashes,
  formatNumericWeeks,
  getEndTimeAsDate,
  getStartTimeAsDate,
  groupLessonsByDay,
  hydrateSemTimetableWithAllLessons,
  hydrateSemTimetableWithNormalLessons,
  hydrateSemTimetableWithTaLessons,
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
const moduleCodeMap = moduleCodeMapJSON as any;

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
  const rawLessons = getModuleTimetable(CS1010S, sem);
  const lessonConfig: ModuleLessonConfig = randomModuleLessonConfig(rawLessons);
  Object.keys(lessonConfig).forEach((lessonType: LessonType) => {
    expect(lessonConfig[lessonType]).toBeTruthy();
  });
});

test('hydrateSemTimetableWithNormalLessons should replace ClassNo with lessons', () => {
  const sem: Semester = 1;
  const moduleCode = 'CS1010S';
  const modules: ModulesMap = { [moduleCode]: CS1010S };
  const config: SemTimetableConfig = {
    [moduleCode]: {
      Tutorial: '8',
      Recitation: '4',
      Lecture: '1',
    },
  };

  const configWithLessons: SemTimetableConfigWithLessons = hydrateSemTimetableWithNormalLessons(
    config,
    modules,
    sem,
  );
  expect(configWithLessons[moduleCode].Tutorial[0].classNo).toBe('8');
  expect(configWithLessons[moduleCode].Recitation[0].classNo).toBe('4');
  expect(configWithLessons[moduleCode].Lecture[0].classNo).toBe('1');
});

test('hydrateSemTimetableWithTaLessons should replace ClassNo with lessons', () => {
  const sem: Semester = 1;
  const moduleCode = 'CS1010S';
  const modules: ModulesMap = { [moduleCode]: CS1010S };
  const taModules: TaModulesConfig = {
    [moduleCode]: [
      ['Tutorial', '1'],
      ['Tutorial', '8'],
      ['Recitation', '4'],
    ],
  };

  const configWithLessons: SemTimetableConfigWithLessons = hydrateSemTimetableWithTaLessons(
    taModules,
    modules,
    sem,
  );
  expect(configWithLessons[moduleCode].Tutorial[0].classNo).toBe('1');
  expect(configWithLessons[moduleCode].Tutorial[1].classNo).toBe('8');
  expect(configWithLessons[moduleCode].Recitation[0].classNo).toBe('4');
  expect(configWithLessons[moduleCode]).not.toHaveProperty('Lecture');
});

test('hydrateSemTimetableWithAllLessons should replace ClassNo with lessons', () => {
  const sem: Semester = 1;
  const taModuleCode = 'CS1010S';
  const nonTaModuleCode = 'CS3216';
  const modules: ModulesMap = { [taModuleCode]: CS1010S, [nonTaModuleCode]: CS3216 };
  const config: SemTimetableConfig = {
    [taModuleCode]: {
      Tutorial: '8',
      Recitation: '4',
      Lecture: '1',
    },
    [nonTaModuleCode]: {
      Lecture: '1',
    },
  };
  const taModules: TaModulesConfig = {
    [taModuleCode]: [
      ['Tutorial', '1'],
      ['Tutorial', '8'],
      ['Recitation', '4'],
    ],
  };
  const configWithLessons: SemTimetableConfigWithLessons = hydrateSemTimetableWithAllLessons(
    config,
    taModules,
    modules,
    sem,
  );
  expect(configWithLessons[taModuleCode].Tutorial[0].classNo).toBe('1');
  expect(configWithLessons[taModuleCode].Tutorial[1].classNo).toBe('8');
  expect(configWithLessons[taModuleCode].Recitation[0].classNo).toBe('4');
  expect(configWithLessons[taModuleCode]).not.toHaveProperty('Lecture');
  expect(configWithLessons[nonTaModuleCode].Lecture[0].classNo).toBe('1');
});

test('lessonsForLessonType should return all lessons belonging to a particular lessonType', () => {
  const sem: Semester = 1;
  const moduleTimetable = getModuleTimetable(CS1010S, sem);
  const lessonType = 'Tutorial';
  const lessons = lessonsForLessonType(moduleTimetable, lessonType);
  expect(lessons.length > 0).toBe(true);
  lessons.forEach((lesson: RawLesson) => {
    expect(lesson.lessonType).toBe(lessonType);
  });
});

test('lessonsForLessonType should return empty array if no such lessonType is present', () => {
  const sem: Semester = 1;
  const moduleTimetable = getModuleTimetable(CS1010S, sem);
  const lessons = lessonsForLessonType(moduleTimetable, 'Dota Session');
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

  // Lessons belong to different lessonType.
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
  const examDate = _.get(getModuleSemesterData(CS1010S, sem), 'examDate');
  if (!examDate) throw new Error('Cannot find ExamDate');
  expect(examClashes).toEqual({ [examDate]: [CS1010S, CS4243] });
});

test('findExamClashes should return empty object if exams do not clash', () => {
  const sem: Semester = 2;
  const examClashes = findExamClashes([CS1010S, PC1222, CS3216], sem);
  expect(examClashes).toEqual({});
});

test('findExamClashes should return non-empty object if exams starting at different times clash', () => {
  const sem: Semester = 1;
  const examClashes = findExamClashes([CS1010S, CS3216 as any, CS1010A], sem);
  const examDate = _.get(getModuleSemesterData(CS1010A, sem), 'examDate');
  if (!examDate) throw new Error('Cannot find ExamDate');
  expect(examClashes).toEqual({ [examDate]: [CS1010S, CS1010A] });
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
    expect(validateTimetableModules({}, moduleCodeMap)).toEqual([{}, []]);
    expect(
      validateTimetableModules(
        {
          CS1010S: {},
          CS2100: {},
        },
        moduleCodeMap,
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
        moduleCodeMap,
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

describe(formatNumericWeeks, () => {
  it('should return null if every week is given', () => {
    expect(formatNumericWeeks(EVERY_WEEK)).toBeNull();
  });

  it('should return even/odd weeks', () => {
    expect(formatNumericWeeks(ODD_WEEK)).toEqual('Odd Weeks');
    expect(formatNumericWeeks(EVEN_WEEK)).toEqual('Even Weeks');
  });

  it('should abbreviate consecutive week numbers', () => {
    expect(formatNumericWeeks([1])).toEqual('Week 1');
    expect(formatNumericWeeks([1, 2, 3, 4])).toEqual('Weeks 1-4');
    expect(formatNumericWeeks([1, 2, 3, 4, 6, 7, 8, 9])).toEqual('Weeks 1-4, 6-9');
    expect(formatNumericWeeks([1, 3, 5])).toEqual('Weeks 1, 3, 5');
    expect(formatNumericWeeks([1, 2, 4, 5, 6, 7])).toEqual('Weeks 1, 2, 4-7');
    expect(formatNumericWeeks([1, 2, 4, 5])).toEqual('Weeks 1, 2, 4, 5');
  });
});

describe(isLessonAvailable, () => {
  function testLessonAvailable(weeks: Weeks, date: Date) {
    return isLessonAvailable(
      { ...createGenericLesson(), weeks },
      date,
      NUSModerator.academicCalendar.getAcadWeekInfo(date),
    );
  }

  test("should return false if the lesson's Weeks does not match the week number", () => {
    expect(
      testLessonAvailable(
        [1, 3, 5, 7, 9, 11],
        // Week 5
        parseISO('2017-09-11'),
      ),
    ).toBe(true);

    expect(
      testLessonAvailable(
        [1, 2, 3],
        // Week 4
        parseISO('2017-09-04'),
      ),
    ).toBe(false);

    expect(
      testLessonAvailable(
        [1, 3, 5, 7, 9, 11],
        // Week 5
        parseISO('2017-09-11'),
      ),
    ).toBe(true);
  });

  test('should return false if the date falls outside the week range', () => {
    expect(
      testLessonAvailable(
        { start: '2017-08-07', end: '2017-10-17' },
        // Week 5
        parseISO('2017-09-11'),
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
