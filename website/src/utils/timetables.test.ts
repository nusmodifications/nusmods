import NUSModerator from 'nusmoderator';
import _, { filter, get, map, mapValues } from 'lodash';
import { parseISO } from 'date-fns';
import {
  TaModulesConfigV1,
  ColoredLesson,
  ModuleLessonConfig,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TimetableArrangement,
  TimetableDayArrangement,
  TimetableDayFormat,
  ModuleLessonConfigV1,
  LessonWithIndex,
} from 'types/timetables';
import {
  LessonType,
  ModuleCode,
  RawLesson,
  RawLessonWithIndex,
  Semester,
  Weeks,
} from 'types/modules';
import { ModulesMap } from 'types/reducers';

import { getModuleSemesterData, getModuleTimetable } from 'utils/modules';

import { CS1010S, CS3216, CS4243, PC1222, CS1010A, GER1000, GES1021 } from '__mocks__/modules';
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
  getClosestLessonConfig,
  getEndTimeAsDate,
  getInteractableLessons,
  getRecoveryLessonIndices,
  getStartTimeAsDate,
  groupLessonsByDay,
  hydrateSemTimetableWithLessons,
  isLessonAvailable,
  isLessonOngoing,
  isSameTimetableConfig,
  isValidSemester,
  lessonsForLessonType,
  migrateModuleLessonConfig,
  parseTaModuleCodes,
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

test('hydrateSemTimetableWithLessons should replace ClassNo with lessons', () => {
  const sem: Semester = 1;
  const moduleCode = 'CS1010S';
  const modulesMap: ModulesMap = { [moduleCode]: CS1010S };
  const config: SemTimetableConfig = {
    [moduleCode]: {
      Tutorial: [42, 43],
      Recitation: [5],
      Lecture: [0],
    },
  };

  const configWithLessons: SemTimetableConfigWithLessons = hydrateSemTimetableWithLessons(
    config,
    modulesMap,
    sem,
  );
  expect(configWithLessons[moduleCode].Tutorial[0].classNo).toBe('8');
  expect(configWithLessons[moduleCode].Tutorial[1].classNo).toBe('9');
  expect(configWithLessons[moduleCode].Recitation[0].classNo).toBe('4');
  expect(configWithLessons[moduleCode].Lecture[0].classNo).toBe('1');
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
  const lessonsGroupedByDay: TimetableDayFormat<ColoredLesson> = groupLessonsByDay(lessons);
  expect(lessonsGroupedByDay.Monday.length).toBe(2);
  expect(lessonsGroupedByDay.Tuesday.length).toBe(1);
  expect(lessonsGroupedByDay.Wednesday.length).toBe(1);
  expect(lessonsGroupedByDay.Thursday.length).toBe(2);
});

// TODO: write one for array lesson overlap
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
  const arrangement0: TimetableDayArrangement<RawLesson> = arrangeLessonsWithinDay([]);
  expect(arrangement0.length).toBe(1);

  // Can fit within one row.
  const arrangement1: TimetableDayArrangement<ColoredLesson> = arrangeLessonsWithinDay(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
    ]),
  );
  expect(arrangement1.length).toBe(1);

  // Two rows.
  const arrangement2: TimetableDayArrangement<ColoredLesson> = arrangeLessonsWithinDay(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1500', '1700'),
    ]),
  );
  expect(arrangement2.length).toBe(2);

  // Three rows.
  const arrangement3: TimetableDayArrangement<ColoredLesson> = arrangeLessonsWithinDay(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1100', '1300'),
      createGenericColoredLesson('Monday', '1000', '1300'),
    ]),
  );
  expect(arrangement3.length).toBe(3);
});

test('arrangeLessonsForWeek', () => {
  const arrangement0: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
    ]),
  );
  expect(arrangement0.Monday.length).toBe(1);

  const arrangement1: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
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

  const arrangement2: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
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

  const arrangement3: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
    _.shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Tuesday', '1100', '1300'),
      createGenericColoredLesson('Wednesday', '1000', '1300'),
    ]),
  );
  expect(arrangement3.Monday.length).toBe(1);
  expect(arrangement3.Tuesday.length).toBe(1);
  expect(arrangement3.Wednesday.length).toBe(1);

  const arrangement4: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
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

  const arrangement5: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
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

describe('getInteractableLessons', () => {
  const modules = {
    PC1222,
    CS4243,
    GES1021,
  };
  const semester = 1;
  const colors = {
    PC1222: 0,
    CS4243: 1,
    GES1021: 2,
  };
  const getIsTaInTimetable = (taModulesConfig: ModuleCode[]) => (moduleCode: ModuleCode) =>
    taModulesConfig.includes(moduleCode);

  const lessonWithIndex: Record<ModuleCode, LessonWithIndex[]> = mapValues(modules, (module) =>
    map(getModuleTimetable(module, semester), (lesson) => ({
      ...lesson,
      moduleCode: module.moduleCode,
      title: module.title,
    })),
  );

  const getLessonsWithIndex = (moduleCode: ModuleCode): LessonWithIndex[] =>
    lessonWithIndex[moduleCode];

  describe('hydrating modules when there is no active lesson', () => {
    const taModuleLessons = [
      getLessonsWithIndex(PC1222.moduleCode)[0],
      getLessonsWithIndex(PC1222.moduleCode)[1],
      getLessonsWithIndex(PC1222.moduleCode)[10],
      getLessonsWithIndex(PC1222.moduleCode)[11],
      getLessonsWithIndex(PC1222.moduleCode)[12],
      getLessonsWithIndex(PC1222.moduleCode)[13],
    ];

    const nonTaModuleLessons = getLessonsWithIndex(CS4243.moduleCode)[0];
    const nonTaModuleLessonsWithNoAlternatives = getLessonsWithIndex(CS4243.moduleCode)[5];

    const timetableLessons: LessonWithIndex[] = [
      ...taModuleLessons,
      nonTaModuleLessons,
      nonTaModuleLessonsWithNoAlternatives,
    ];

    const isTaInTimetable = getIsTaInTimetable([PC1222.moduleCode]);
    const readOnly = false;
    const activeLesson = null;

    const hydratedLessons = getInteractableLessons(
      timetableLessons,
      modules,
      semester,
      colors,
      readOnly,
      isTaInTimetable,
      activeLesson,
    );

    test('hydration of lessons belonging to ta module', () => {
      const setOfExpectedHydratedLessons = new Set(
        map(taModuleLessons, (lesson) => ({
          ...lesson,
          canBeAddedToLessonConfig: false, // lessons are already in timetable
          canBeSelectedAsActiveLesson: true, // all lessons from ta modules can be selected as the active lesson
          colorIndex: 0,
          isActive: false, // no lessons are active
          isTaInTimetable: true, // lesson belongs to a ta module
        })),
      );
      const setOfHydratedLessons = new Set(
        filter(hydratedLessons, (lesson) => lesson.moduleCode === PC1222.moduleCode),
      );

      expect(setOfHydratedLessons).toEqual(setOfExpectedHydratedLessons);
    });

    test('hydration of lessons belonging to non-ta module', () => {
      expect(hydratedLessons).toContainEqual({
        ...getLessonsWithIndex(CS4243.moduleCode)[0],
        canBeAddedToLessonConfig: false,
        canBeSelectedAsActiveLesson: true,
        colorIndex: 1,
        isActive: false,
        isTaInTimetable: false,
      });
    });

    test('hydration of lessons with no alternative lessons', () => {
      expect(hydratedLessons).toContainEqual({
        ...getLessonsWithIndex(CS4243.moduleCode)[5],
        canBeAddedToLessonConfig: false,
        canBeSelectedAsActiveLesson: false,
        colorIndex: 1,
        isActive: false,
        isTaInTimetable: false,
      });
    });

    test('only lessons in timetable should be visible', () => {
      expect(hydratedLessons).toHaveLength(8);
    });
  });

  describe('hydrating modules when there is an active lesson from a non-ta module', () => {
    const activeLesson = getLessonsWithIndex(PC1222.moduleCode)[0];

    const otherLessons = [
      getLessonsWithIndex(PC1222.moduleCode)[10],
      getLessonsWithIndex(PC1222.moduleCode)[12],
    ];

    const timetableLessons = [activeLesson, ...otherLessons];

    const isTaInTimetable = getIsTaInTimetable([CS4243.moduleCode]);
    const readOnly = false;

    const hydratedLessons = getInteractableLessons(
      timetableLessons,
      modules,
      semester,
      colors,
      readOnly,
      isTaInTimetable,
      activeLesson,
    );

    test('hydration of active lesson', () => {
      expect(hydratedLessons).toContainEqual({
        ...activeLesson,
        canBeAddedToLessonConfig: false, // Active lessons are already in the lesson config
        canBeSelectedAsActiveLesson: true,
        colorIndex: 0,
        isActive: true,
        isTaInTimetable: false,
      });
    });

    test('hydration of other lessons from lesson type', () => {
      const setOfExpectedHydratedLessons = new Set(
        map(
          filter(
            getLessonsWithIndex(PC1222.moduleCode),
            (lesson) =>
              lesson.lessonType === activeLesson.lessonType &&
              lesson.classNo !== activeLesson.classNo,
          ),
          (lesson) => ({
            ...lesson,
            canBeAddedToLessonConfig: true,
            canBeSelectedAsActiveLesson: true,
            colorIndex: 0,
            isActive: false,
            isTaInTimetable: false,
          }),
        ),
      );
      const setOfHydratedLessons = new Set(
        filter(
          hydratedLessons,
          (lesson) =>
            lesson.lessonType === activeLesson.lessonType &&
            lesson.classNo !== activeLesson.classNo,
        ),
      );

      expect(setOfHydratedLessons).toEqual(setOfExpectedHydratedLessons);
    });
  });

  describe('hydrating modules when there is an active lesson from a ta module', () => {
    const lessonsFromOtherModule = [
      getLessonsWithIndex(PC1222.moduleCode)[0],
      getLessonsWithIndex(PC1222.moduleCode)[10],
      getLessonsWithIndex(PC1222.moduleCode)[12],
    ];

    const activeLesson = getLessonsWithIndex(CS4243.moduleCode)[0];
    const lessonsFromActiveModule = [
      activeLesson,
      getLessonsWithIndex(CS4243.moduleCode)[1],
      getLessonsWithIndex(CS4243.moduleCode)[5],
    ];

    const timetableLessons: LessonWithIndex[] = [
      activeLesson,
      ...lessonsFromOtherModule,
      ...lessonsFromActiveModule,
    ];

    const isTaInTimetable = getIsTaInTimetable([CS4243.moduleCode]);
    const readOnly = false;

    const hydratedLessons = getInteractableLessons(
      timetableLessons,
      modules,
      semester,
      colors,
      readOnly,
      isTaInTimetable,
      activeLesson,
    );

    test('hydration of lessons of other modules', () => {
      const setOfExpectedHydratedLessons = new Set([
        {
          ...getLessonsWithIndex(PC1222.moduleCode)[0],
          canBeAddedToLessonConfig: false,
          canBeSelectedAsActiveLesson: true,
          colorIndex: 0,
          isActive: false,
          isTaInTimetable: false,
        },
        {
          ...getLessonsWithIndex(PC1222.moduleCode)[10],
          canBeAddedToLessonConfig: false,
          canBeSelectedAsActiveLesson: false,
          colorIndex: 0,
          isActive: false,
          isTaInTimetable: false,
        },
        {
          ...getLessonsWithIndex(PC1222.moduleCode)[12],
          canBeAddedToLessonConfig: false,
          canBeSelectedAsActiveLesson: true,
          colorIndex: 0,
          isActive: false,
          isTaInTimetable: false,
        },
      ]);

      const setOfHydratedLessons = new Set(
        filter(hydratedLessons, (lesson) => lesson.moduleCode === PC1222.moduleCode),
      );

      expect(setOfHydratedLessons).toEqual(setOfExpectedHydratedLessons);
    });

    test('hydration of active lesson', () => {
      expect(hydratedLessons).toContainEqual({
        ...activeLesson,
        canBeAddedToLessonConfig: false,
        canBeSelectedAsActiveLesson: true,
        colorIndex: 1,
        isActive: true,
        isTaInTimetable: true,
      });
    });

    test('hydration of other lessons in timetable', () => {
      expect(hydratedLessons).toContainEqual({
        ...getLessonsWithIndex(CS4243.moduleCode)[1],
        canBeAddedToLessonConfig: false,
        canBeSelectedAsActiveLesson: true,
        colorIndex: 1,
        isActive: false,
        isTaInTimetable: true,
      });
    });

    test('hydration of lessons not currently in timetable', () => {
      expect(hydratedLessons).toContainEqual({
        ...getLessonsWithIndex(CS4243.moduleCode)[2],
        canBeAddedToLessonConfig: true,
        canBeSelectedAsActiveLesson: true,
        colorIndex: 1,
        isActive: false,
        isTaInTimetable: true,
      });
    });

    test('all lessons of a ta module are interactable', () => {
      expect(hydratedLessons).toContainEqual({
        ...getLessonsWithIndex(CS4243.moduleCode)[5],
        canBeAddedToLessonConfig: false,
        canBeSelectedAsActiveLesson: true, // in ta modules, lessons that are the only one of their lesson type can be selected or removed
        colorIndex: 1,
        isActive: false,
        isTaInTimetable: true,
      });
    });

    test("all lessons from the active lesson's module should be visible, currently selected lessons and active lesson should not appear twice", () => {
      expect(
        filter(hydratedLessons, (lesson) => lesson.moduleCode === CS4243.moduleCode),
      ).toHaveLength(6);
    });
  });

  test('hydrating non-ta module containing multiple lessons with the same classNo', () => {
    const timetableLessons = [
      getLessonsWithIndex(GES1021.moduleCode)[0],
      getLessonsWithIndex(GES1021.moduleCode)[1],
    ];

    const isTaInTimetable = getIsTaInTimetable([]);
    const readOnly = false;
    const activeLesson = null;

    const hydratedLessons = getInteractableLessons(
      timetableLessons,
      modules,
      semester,
      colors,
      readOnly,
      isTaInTimetable,
      activeLesson,
    );

    expect(hydratedLessons).toStrictEqual(
      map(timetableLessons, (lesson) => ({
        ...lesson,
        canBeAddedToLessonConfig: false,
        canBeSelectedAsActiveLesson: false,
        colorIndex: 2,
        isActive: false,
        isTaInTimetable: false,
      })),
    );
  });

  describe('hydrating ta module containing multiple lessons with the same classNo', () => {
    const timetableLessons = [getLessonsWithIndex(GES1021.moduleCode)[0]];

    const isTaInTimetable = getIsTaInTimetable([GES1021.moduleCode]);
    const readOnly = false;

    test('when no lessons are active', () => {
      const activeLesson = null;

      const hydratedLessons = getInteractableLessons(
        timetableLessons,
        modules,
        semester,
        colors,
        readOnly,
        isTaInTimetable,
        activeLesson,
      );

      expect(hydratedLessons).toStrictEqual([
        {
          ...getLessonsWithIndex(GES1021.moduleCode)[0],
          canBeAddedToLessonConfig: false,
          canBeSelectedAsActiveLesson: true,
          colorIndex: 2,
          isActive: false,
          isTaInTimetable: true,
        },
      ]);
    });

    test('when a lesson is active', () => {
      const activeLesson = getLessonsWithIndex(GES1021.moduleCode)[0];

      const hydratedLessons = getInteractableLessons(
        timetableLessons,
        modules,
        semester,
        colors,
        readOnly,
        isTaInTimetable,
        activeLesson,
      );

      expect(hydratedLessons).toStrictEqual([
        {
          ...getLessonsWithIndex(GES1021.moduleCode)[0],
          canBeAddedToLessonConfig: false,
          canBeSelectedAsActiveLesson: true,
          colorIndex: 2,
          isActive: true,
          isTaInTimetable: true,
        },
        {
          ...getLessonsWithIndex(GES1021.moduleCode)[1],
          canBeAddedToLessonConfig: true,
          canBeSelectedAsActiveLesson: true,
          colorIndex: 2,
          isActive: false,
          isTaInTimetable: true,
        },
      ]);
    });
  });

  describe('hydrating modules in a read-only timetable', () => {
    const taModuleLessons = [
      getLessonsWithIndex(PC1222.moduleCode)[0],
      getLessonsWithIndex(PC1222.moduleCode)[10],
      getLessonsWithIndex(PC1222.moduleCode)[12],
    ];

    const nonTaModuleLessons = [
      getLessonsWithIndex(CS4243.moduleCode)[0],
      getLessonsWithIndex(CS4243.moduleCode)[5],
    ];

    const timetableLessons = [...taModuleLessons, ...nonTaModuleLessons];

    const isTaInTimetable = getIsTaInTimetable([PC1222.moduleCode]);
    const readOnly = true;
    const activeLesson = null;

    const hydratedLessons = getInteractableLessons(
      timetableLessons,
      modules,
      semester,
      colors,
      readOnly,
      isTaInTimetable,
      activeLesson,
    );

    test('hydration of lessons from ta modules', () => {
      expect(hydratedLessons).toContainEqual({
        ...getLessonsWithIndex(PC1222.moduleCode)[0],
        canBeAddedToLessonConfig: false,
        canBeSelectedAsActiveLesson: false,
        colorIndex: 0,
        isActive: false,
        isTaInTimetable: true,
      });
    });

    test('hydration of lessons from non-ta modules', () => {
      expect(hydratedLessons).toContainEqual({
        ...getLessonsWithIndex(CS4243.moduleCode)[0],
        canBeAddedToLessonConfig: false,
        canBeSelectedAsActiveLesson: false,
        colorIndex: 1,
        isActive: false,
        isTaInTimetable: false,
      });
    });
  });
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

describe('timetable serialization/deserialization', () => {
  const mockSemesterTimetable: { [moduleCode: ModuleCode]: readonly RawLessonWithIndex[] } = {
    CS1010S: getModuleTimetable(CS1010S, 1),
    CS3216: getModuleTimetable(CS3216, 1),
    GER1000: getModuleTimetable(GER1000, 1),
    CS4243: getModuleTimetable(CS4243, 1),
  };
  const mockGetModuleSemesterTimetable = (moduleCode: ModuleCode): readonly RawLessonWithIndex[] =>
    get(mockSemesterTimetable, moduleCode);

  test('timetable serialization/deserialization', () => {
    const configs: SemTimetableConfig[] = [
      {},
      { CS1010S: {} },
      {
        GER1000: { Tutorial: [13] },
      },
      {
        CS4243: { Laboratory: [2], Lecture: [5] },
        GER1000: { Tutorial: [13] },
      },
    ];

    configs.forEach((config) => {
      expect(
        deserializeTimetable(serializeTimetable(config), mockGetModuleSemesterTimetable)
          .semTimetableConfig,
      ).toEqual(config);
    });
  });

  test('deserializing timetable with ta and hidden modules', () => {
    expect(
      deserializeTimetable(
        'CS1010S=LEC:(0)&CS3216=LEC:(0)&ta=CS1010S&hidden=CS3216',
        mockGetModuleSemesterTimetable,
      ),
    ).toEqual({
      semTimetableConfig: {
        CS1010S: {
          Lecture: [0],
        },
        CS3216: {
          Lecture: [0],
        },
      },
      ta: ['CS1010S'],
      hidden: ['CS3216'],
    });
  });

  describe('deserializing edge cases', () => {
    test('duplicate module code', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:(0)&CS1010S=REC:(1)', mockGetModuleSemesterTimetable)
          .semTimetableConfig,
      ).toEqual({
        CS1010S: {
          Lecture: [0],
          Recitation: [1],
        },
      });
    });

    test('no lessons', () => {
      expect(
        deserializeTimetable(
          'CS2105&CS3217&CS1010S=LEC:(0)&ta=&hidden=',
          mockGetModuleSemesterTimetable,
        ).semTimetableConfig,
      ).toEqual({
        CS2105: {},
        CS3217: {},
        CS1010S: {
          Lecture: [0],
        },
      });
    });

    test('should ignore invalid lesson indices', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:(20)', mockGetModuleSemesterTimetable).semTimetableConfig,
      ).toEqual({
        CS1010S: {
          Lecture: [],
        },
      });
    });
  });

  test('should return empty array if v2 serialized', () => {
    expect(parseTaModuleCodes('(CS1010S,CS3216)')).toEqual([]);
  });

  describe('deserialize v1 config', () => {
    test('deserialize v1', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1,TUT:8&CS3216=LEC:1&ta=CS3216(LEC:1),CS1010S(LEC:1,TUT:2,TUT:3)&hidden=CS3216',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [0],
            Tutorial: [21, 30],
          },
          CS3216: {
            Lecture: [0],
          },
        },
        ta: ['CS3216', 'CS1010S'],
        hidden: ['CS3216'],
      });
    });

    test('should ignore invalid lesson type', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1&ta=CS1010S(TUT:2,INVALIDLESSONTYPE:1)',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Tutorial: [21],
          },
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('should ignore invalid classNo', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:INVALIDCLASSNO', mockGetModuleSemesterTimetable),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [],
          },
        },
        ta: [],
        hidden: [],
      });
    });

    test('use only last ta param', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1&ta=CS3216(LEC:1)&ta=CS1010S(TUT:2)',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Tutorial: [21],
          },
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('should ignore invalid ta lessons', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:1&ta=CS1010S(LEC:2)', mockGetModuleSemesterTimetable),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [],
          },
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('ta module config without lessons', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:1,TUT:3&ta=CS1010S()', mockGetModuleSemesterTimetable),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {},
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('ignore modules without semester data', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1,REC:1,TUT:3&ta=CS3217(LEC:1)',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [0],
            Recitation: [1],
            Tutorial: [30],
          },
        },
        ta: [],
        hidden: [],
      });
    });

    test('should ignore invalid ta module config', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1,REC:1,TUT:3&ta=INVALID),CS1010S(LEC:1)',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [0],
          },
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('should return array of module codes', () => {
      expect(parseTaModuleCodes('CS1010S(LEC:1,TUT:1),CS3216(LEC:1)')).toEqual([
        'CS1010S',
        'CS3216',
      ]);
    });
  });
});

test('isSameTimetableConfig', () => {
  // Empty timetable
  expect(isSameTimetableConfig({}, {})).toBe(true);

  // Change lessonType order
  expect(
    isSameTimetableConfig(
      { CS2104: { Tutorial: [1], Lecture: [2] } },
      { CS2104: { Lecture: [2], Tutorial: [1] } },
    ),
  ).toBe(true);

  // Change module order
  expect(
    isSameTimetableConfig(
      {
        CS2104: { Lecture: [1], Tutorial: [2] },
        CS2105: { Lecture: [1], Tutorial: [1] },
      },
      {
        CS2105: { Lecture: [1], Tutorial: [1] },
        CS2104: { Lecture: [1], Tutorial: [2] },
      },
    ),
  ).toBe(true);

  // Different values
  expect(
    isSameTimetableConfig(
      { CS2104: { Lecture: [1], Tutorial: [2] } },
      { CS2104: { Lecture: [2], Tutorial: [1] } },
    ),
  ).toBe(false);

  // One is subset of the other
  expect(
    isSameTimetableConfig(
      {
        CS2104: { Tutorial: [1], Lecture: [2] },
      },
      {
        CS2104: { Tutorial: [1], Lecture: [2] },
        CS2105: { Lecture: [1], Tutorial: [1] },
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

// TODO: validate module lessons
// - either normal non-TA or TA module
//   - remove lesson group if there are lessons of other lesson types
// - if module is a normal non TA module:
//   - remove lesson group if any lesson is missing
//   - remove lesson group if there are extra lessons
//
describe(validateModuleLessons, () => {
  const semester: Semester = 1;
  const lessons: ModuleLessonConfig = {
    Lecture: [0],
    Recitation: [2],
    Tutorial: [13],
  };

  describe('validate non ta module lessons', () => {
    test('should leave valid lessons untouched', () => {
      expect(validateModuleLessons(semester, lessons, CS1010S, false)).toEqual({
        validatedLessonConfig: lessons,
        valid: true,
      });
    });

    test('should remove lesson types which do not exist in module', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Laboratory: [0], // CS1010S has no lab
          },
          CS1010S,
          false,
        ),
      ).toEqual({ validatedLessonConfig: lessons, valid: false });
    });

    test('should replace lessons that have invalid class no', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Lecture: [2], // CS1010S lesson index 2 is not a lecture
          },
          CS1010S,
          false,
        ),
      ).toEqual({ validatedLessonConfig: lessons, valid: false });
    });

    test('should add lessons for when they are missing', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            Tutorial: [13],
          },
          CS1010S,
          false,
        ),
      ).toEqual({
        validatedLessonConfig: {
          Lecture: [0],
          Recitation: [1],
          Tutorial: [13],
        },
        valid: false,
      });
    });
  });

  describe('validate ta module lessons', () => {
    test('should leave valid config untouched', () => {
      expect(validateModuleLessons(semester, lessons, CS1010S, true)).toEqual({
        validatedLessonConfig: lessons,
        valid: true,
      });
    });

    test('should remove lesson types which do not exist in module', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Laboratory: [0],
          },
          CS1010S,
          true,
        ),
      ).toEqual({
        validatedLessonConfig: lessons,
        valid: false,
      });
    });

    test('should replace lessons that have invalid class no', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Lecture: [1],
          },
          CS1010S,
          true,
        ),
      ).toEqual({
        validatedLessonConfig: lessons,
        valid: false,
      });
    });
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

describe('v1 config migration', () => {
  const moduleLessonConfig = {
    Lecture: '1',
  };
  const moduleTimetable = getModuleTimetable(CS1010S, 1);
  test('should do nothing if already migrated', () => {
    const migrationResult = migrateModuleLessonConfig(
      {
        Lecture: [0],
      },
      [],
      'CS1010S',
      moduleTimetable,
    );
    expect(migrationResult).toEqual({
      migratedModuleLessonConfig: {
        Lecture: [0],
      },
      alreadyMigrated: true,
    });
  });

  test('should not error if ta module config was migrated but module lesson config was not', () => {
    const migrationResult = migrateModuleLessonConfig(
      moduleLessonConfig,
      [],
      'CS1010S',
      moduleTimetable,
    );
    expect(migrationResult).toEqual({
      migratedModuleLessonConfig: {
        Lecture: [0],
      },
      alreadyMigrated: false,
    });
  });

  test('should error if migration is missing data to migrate from the old config', () => {
    const taModuleConfig = {
      CS1010S: [['Lecture', '1']],
    } as TaModulesConfigV1;
    expect(() =>
      migrateModuleLessonConfig(moduleLessonConfig, taModuleConfig, 'CS1010S', []),
    ).toThrow(Error('Lesson indices missing'));
  });

  test('should error if migration cannot find the lesson indices for non-ta module classNo', () => {
    const invalidModuleLessonConfig = {
      Lecture: '2',
    } as ModuleLessonConfigV1;
    expect(() =>
      migrateModuleLessonConfig(
        invalidModuleLessonConfig,
        {
          CS1010S: [],
        },
        'CS1010S',
        moduleTimetable,
      ),
    ).toThrow(Error('Lesson indices missing'));
  });

  test('should error if migration cannot find the lesson indices for ta module classNo', () => {
    const taModuleConfig = {
      CS1010S: [
        ['Lecture', '1'],
        ['Lecture', '2'],
      ],
    } as TaModulesConfigV1;
    expect(() =>
      migrateModuleLessonConfig(moduleLessonConfig, taModuleConfig, 'CS1010S', moduleTimetable),
    ).toThrow(Error('Lesson indices missing'));
  });
});

describe(getClosestLessonConfig, () => {
  test('ignore if lesson type has no classNo', () => {
    expect(getClosestLessonConfig({ Lecture: {} }, { Lecture: [0] })).toEqual({});
  });
});

describe(getRecoveryLessonIndices, () => {
  test('guard against empty lessons input', () => {
    expect(getRecoveryLessonIndices([])).toEqual([]);
  });
});
