import { filter, flatMap, get, map, mapValues, shuffle, some, values } from 'lodash-es';
import {
  InteractableLesson,
  Lesson,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
} from 'types/timetables';
import { LessonId, LessonType, ModuleCode, ModuleLessonMap, RawLesson } from 'types/modules';

import { getModuleLessonMap, getModuleTimetable } from 'utils/modules';

import { CS4243, PC1222, GES1021 } from '__mocks__/modules';
import { createGenericLesson } from 'test-utils/timetable';

import { areOtherClassesAvailable, getInteractableLessons } from './interactabilityHydration';
import { hydrateSemTimetableWithLessons } from './lessonHydration';
import { serializeLessonDetails } from './lessonId';
import { timetableLessonsArray } from 'utils/timetables';

test('areOtherClassesAvailable', () => {
  // Lessons belong to different ClassNo.
  const lessons1: RawLesson[] = shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '2'),
    createGenericLesson('Monday', '1400', '1500', 'Lecture', '3'),
  ]);
  expect(areOtherClassesAvailable(lessons1, 'Lecture')).toBe(true);
  expect(areOtherClassesAvailable(lessons1, 'Tutorial')).toBe(false);

  // Lessons belong to the same ClassNo.
  const lessons2: RawLesson[] = shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Lecture', '1'),
  ]);
  expect(areOtherClassesAvailable(lessons2, 'Lecture')).toBe(false);

  // Lessons belong to different lessonType.
  const lessons3: RawLesson[] = shuffle([
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
    [PC1222.moduleCode]: PC1222,
    [CS4243.moduleCode]: CS4243,
    [GES1021.moduleCode]: GES1021,
  };
  const semester = 1;
  const colors = {
    PC1222: 0,
    CS4243: 1,
    GES1021: 2,
  };
  const lessonIds = (lessons: readonly (Lesson | RawLesson | InteractableLesson)[]) =>
    new Set(map(lessons, serializeLessonDetails));

  const lessonsMap: Record<ModuleCode, Record<LessonType, Record<LessonId, Lesson>>> = mapValues(
    modules,
    (module) =>
      mapValues(getModuleLessonMap(module, semester), (lessonsWithLessonType) =>
        mapValues(lessonsWithLessonType, (lesson) => ({
          ...lesson,
          moduleCode: module.moduleCode,
          title: module.title,
        })),
      ),
  );

  describe('hydrating modules when there is no active lesson', () => {
    const lessonWithAlternative: LessonId = '1|TUE|1400|1600|AS6-0421|3_4_5_6_7_8_9_10_11_12_13';
    const lessonWithNoAlternative: LessonId = '1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13';

    const semTimetableConfig: SemTimetableConfig = {
      [PC1222.moduleCode]: {
        Laboratory: [
          'F01|FRI|1400|1700|S12-0402|3_5_7_9_11',
          'F02|FRI|1400|1700|S12-0402|4_6_8_10_12',
        ],
        Lecture: ['SL1|TUE|1200|1400|LT25|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        Tutorial: [
          'SL1|FRI|1200|1400|LT25|1_2_3_4_5_6_7_8_9_10_11_12_13',
          'T1|MON|1600|1700|S11-0204|1_2_3_4_5_6_7_8_9_10_11_12_13',
          'T10|FRI|1700|1800|S11-0204|1_2_3_4_5_6_7_8_9_10_11_12_13',
        ],
      },
      [CS4243.moduleCode]: {
        Laboratory: [lessonWithAlternative],
        Lecture: [lessonWithNoAlternative],
      },
    };

    const timetableLessons: SemTimetableConfigWithLessons<Lesson> = hydrateSemTimetableWithLessons(
      semTimetableConfig,
      modules,
      semester,
    );

    const readOnly = false;
    const activeLesson = null;

    const hydratedLessons: SemTimetableConfigWithLessons<InteractableLesson> =
      getInteractableLessons(
        timetableLessons,
        modules,
        semester,
        colors,
        readOnly,
        (moduleCode: ModuleCode) => moduleCode === PC1222.moduleCode,
        activeLesson,
      );

    const allLessons: InteractableLesson[] = flatMap(hydratedLessons, (modulesLessons) =>
      flatMap(modulesLessons, (lessonTypeLessons) => values(lessonTypeLessons)),
    );

    test('all lessons are marked as non active because there is no active lesson', () => {
      expect(some(allLessons, (lesson) => lesson.isActive)).toBe(false);
    });

    test('when there are no active lessons, only lessons that are in timetable are present, they cannot be added to lesson config', () => {
      expect(some(allLessons, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(false);
    });

    test('lessons from ta module are marked as ta in timetable', () => {
      const lessonsFromTaModule: InteractableLesson[] = flatMap(
        get(hydratedLessons, PC1222.moduleCode),
        (lessons) => values(lessons),
      );
      expect(some(lessonsFromTaModule, (lesson) => !lesson.isTaInTimetable)).toBe(false);
    });

    test('lessons from non-ta module are marked as not ta in timetable', () => {
      const lessonsFromNonTaModule: InteractableLesson[] = flatMap(
        get(hydratedLessons, CS4243.moduleCode),
        (lessons) => values(lessons),
      );
      expect(some(lessonsFromNonTaModule, (lesson) => lesson.isTaInTimetable)).toBe(false);
    });

    test('hydration of lessons with alternative lessons', () => {
      expect(
        get(hydratedLessons, [CS4243.moduleCode, 'Laboratory', lessonWithAlternative])
          ?.canBeSelectedAsActiveLesson,
      ).toBe(true);
    });

    test('hydration of lessons with no alternative lessons', () => {
      expect(
        get(hydratedLessons, [CS4243.moduleCode, 'Lecture', lessonWithNoAlternative])
          ?.canBeSelectedAsActiveLesson,
      ).toBe(false);
    });

    test('should only show lessons in timetable when no lesson is active', () => {
      expect(lessonIds(allLessons)).toEqual(
        lessonIds(
          flatMap(timetableLessons, (moduleLessons) =>
            flatMap(moduleLessons, (lessons) => values(lessons)),
          ),
        ),
      );
    });
  });

  describe('hydrating modules when there is an active lesson from a non-ta module', () => {
    const activeLessonId: LessonId = 'F01|FRI|1400|1700|S12-0402|3_5_7_9_11';

    const semTimetableConfig: SemTimetableConfig = {
      [PC1222.moduleCode]: {
        Laboratory: [activeLessonId],
        Lecture: ['SL1|TUE|1200|1400|LT25|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        Tutorial: ['T1|MON|1600|1700|S11-0204|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      },
    };

    const timetableLessons: SemTimetableConfigWithLessons<Lesson> = hydrateSemTimetableWithLessons(
      semTimetableConfig,
      modules,
      semester,
    );

    const readOnly = false;
    const activeLesson: Lesson = get(timetableLessons, [
      PC1222.moduleCode,
      'Laboratory',
      activeLessonId,
    ]);

    const hydratedLessons: SemTimetableConfigWithLessons<InteractableLesson> =
      getInteractableLessons(
        timetableLessons,
        modules,
        semester,
        colors,
        readOnly,
        (_: ModuleCode) => false,
        activeLesson,
      );

    const hydratedActiveLesson: InteractableLesson = get(hydratedLessons, [
      PC1222.moduleCode,
      'Laboratory',
      activeLessonId,
    ]);

    test('active lesson should be marked as active', () => {
      expect(hydratedActiveLesson?.isActive).toBe(true);
    });

    test('active lesson is already in lesson config', () => {
      expect(hydratedActiveLesson?.canBeAddedToLessonConfig).toBe(false);
    });

    const hydratedAlternativeLessons: InteractableLesson[] = filter(
      flatMap(get(hydratedLessons, PC1222.moduleCode), (lessons) => values(lessons)),
      (lesson) =>
        lesson.lessonType === activeLesson.lessonType && lesson.classNo !== activeLesson.classNo,
    );

    test('alternative lessons can be added to the lesson config', () => {
      expect(some(hydratedAlternativeLessons, (lesson) => !lesson.canBeAddedToLessonConfig)).toBe(
        false,
      );
    });

    test('all alternative lessons are displayed', () => {
      const alternativeLessons: Lesson[] = filter(
        flatMap(get(lessonsMap, PC1222.moduleCode), (lessons) => values(lessons)),
        (lesson) =>
          lesson.lessonType === activeLesson.lessonType && lesson.classNo !== activeLesson.classNo,
      );

      const lessonIdsOfAlternativeLessons = new Set(
        map(alternativeLessons, serializeLessonDetails),
      );
      const lessonIdsOfHydratedAlternativeLessons = new Set(
        map(hydratedAlternativeLessons, serializeLessonDetails),
      );

      expect(lessonIdsOfAlternativeLessons).toEqual(lessonIdsOfHydratedAlternativeLessons);
    });
  });

  describe('hydrating modules when there is an active lesson from a ta module', () => {
    const activeLessonId: LessonId = 'F01|FRI|1400|1700|S12-0402|3_5_7_9_11';

    const timetableLessonsKeys: LessonId[] = [
      activeLessonId,
      'F02|FRI|1400|1700|S12-0402|3_5_7_9_11',
      'M01|MON|1400|1700|S12-0402|4_6_8_10_12',
    ];

    const semTimetableConfig: SemTimetableConfig = {
      [PC1222.moduleCode]: {
        Laboratory: timetableLessonsKeys,
        Lecture: ['SL1|TUE|1200|1400|LT25|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        Tutorial: ['T1|MON|1600|1700|S11-0204|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      },
      [CS4243.moduleCode]: {
        Laboratory: ['1|TUE|1400|1600|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
        Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      },
    };

    const timetableLessons: SemTimetableConfigWithLessons<Lesson> = hydrateSemTimetableWithLessons(
      semTimetableConfig,
      modules,
      semester,
    );

    const readOnly: boolean = false;
    const activeLesson: Lesson = get(timetableLessons, [
      PC1222.moduleCode,
      'Laboratory',
      activeLessonId,
    ]);

    const hydratedLessons: SemTimetableConfigWithLessons<InteractableLesson> =
      getInteractableLessons(
        timetableLessons,
        modules,
        semester,
        colors,
        readOnly,
        (moduleCode: ModuleCode) => moduleCode === PC1222.moduleCode,
        activeLesson,
      );

    const hydratedOtherModuleLessons: ModuleLessonMap<InteractableLesson> = get(
      hydratedLessons,
      CS4243.moduleCode,
    );

    test('lessons that are not from the same module as the active lesson cannot be added', () => {
      expect(
        some(
          flatMap(hydratedOtherModuleLessons, (lessons) => values(lessons)),
          (lesson) => lesson.canBeAddedToLessonConfig,
        ),
      ).toBe(false);
    });

    test('timetable lessons from other modules are visible', () => {
      const otherModuleLessons = flatMap(get(timetableLessons, CS4243.moduleCode), (lessons) =>
        values(lessons),
      );
      const hydratedOtherModuleLessonsArray = flatMap(hydratedOtherModuleLessons, (lessons) =>
        values(lessons),
      );

      expect(lessonIds(hydratedOtherModuleLessonsArray)).toEqual(lessonIds(otherModuleLessons));
    });

    const hydratedActiveLesson: InteractableLesson = get(hydratedLessons, [
      PC1222.moduleCode,
      'Laboratory',
      activeLessonId,
    ]);

    test('active lesson should be marked as active', () => {
      expect(hydratedActiveLesson?.isActive).toBe(true);
    });

    test('active lesson is already in lesson config', () => {
      expect(hydratedActiveLesson?.canBeAddedToLessonConfig).toBe(false);
    });

    const hydratedActiveModuleLessons: InteractableLesson[] = flatMap(
      get(hydratedLessons, PC1222.moduleCode),
      (lessons) => values(lessons),
    );

    test('all lessons of a ta module are interactable', () => {
      expect(
        some(hydratedActiveModuleLessons, (lesson) => !lesson.canBeSelectedAsActiveLesson),
      ).toBe(false);
    });

    test("all lessons from the active lesson's module should be visible, currently selected lessons and active lesson should not appear twice", () => {
      expect(lessonIds(hydratedActiveModuleLessons)).toEqual(
        lessonIds(getModuleTimetable(PC1222, semester)),
      );
    });

    const hydratedAlternativeLessons: InteractableLesson[] = filter(
      hydratedActiveModuleLessons,
      (lesson) =>
        lesson.lessonType === activeLesson.lessonType && lesson.classNo !== activeLesson.classNo,
    );

    test('alternative lessons in timetable are already added to the lesson config', () => {
      const alternativeTimetableLessonsArray: InteractableLesson[] = filter(
        hydratedAlternativeLessons,
        (lesson) => timetableLessonsKeys.includes(serializeLessonDetails(lesson)),
      );

      expect(
        some(alternativeTimetableLessonsArray, (lesson) => lesson.canBeAddedToLessonConfig),
      ).toBe(false);
    });

    test('alternative lessons not in timetable can be added to the lesson config', () => {
      const alternativeNonTimetableLessonsArray: InteractableLesson[] = filter(
        hydratedAlternativeLessons,
        (lesson) => !timetableLessonsKeys.includes(serializeLessonDetails(lesson)),
      );

      expect(
        some(alternativeNonTimetableLessonsArray, (lesson) => !lesson.canBeAddedToLessonConfig),
      ).toBe(false);
    });

    test('all alternative lessons are displayed', () => {
      const alternativeLessons: Lesson[] = filter(
        flatMap(get(lessonsMap, PC1222.moduleCode), (lessons) => values(lessons)),
        (lesson) =>
          lesson.lessonType === activeLesson.lessonType && lesson.classNo !== activeLesson.classNo,
      );
      const lessonIdsOfAlternativeLessons = new Set(
        map(alternativeLessons, serializeLessonDetails),
      );
      const lessonIdsOfHydratedAlternativeLessons = new Set(
        map(hydratedAlternativeLessons, serializeLessonDetails),
      );

      expect(lessonIdsOfAlternativeLessons).toEqual(lessonIdsOfHydratedAlternativeLessons);
    });
  });

  describe('hydrating non-ta module containing multiple lessons with the same classNo', () => {
    const timetableLessonsKeys: LessonId[] = [
      'SL1|MON|1600|1800|LT27|1_2_3_4_5_6_7_8_9_10_11_12_13',
      'SL1|WED|1600|1800|LT27|1_2_3_4_5_6_7_8_9_10_11_12_13',
    ];

    const semTimetableConfig: SemTimetableConfig = {
      [GES1021.moduleCode]: {
        Lecture: timetableLessonsKeys,
      },
    };

    const timetableLessons: SemTimetableConfigWithLessons<Lesson> = hydrateSemTimetableWithLessons(
      semTimetableConfig,
      modules,
      semester,
    );

    const readOnly = false;
    const activeLesson = null;

    const hydratedLessons: SemTimetableConfigWithLessons<InteractableLesson> =
      getInteractableLessons(
        timetableLessons,
        modules,
        semester,
        colors,
        readOnly,
        (_: ModuleCode) => false,
        activeLesson,
      );

    const hydratedTimetableLessons: InteractableLesson[] = flatMap(
      get(hydratedLessons, [GES1021.moduleCode, 'Lecture']),
    );

    test('lessons in timetable are already added to lesson config', () => {
      expect(some(hydratedTimetableLessons, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(
        false,
      );
    });

    test('should only show lessons in timetable when no lesson is active', () => {
      expect(lessonIds(hydratedTimetableLessons)).toEqual(
        lessonIds(timetableLessonsArray(timetableLessons)),
      );
    });
  });

  describe('hydrating ta module containing multiple lessons with the same classNo', () => {
    const timetableLessonIds: LessonId[] = ['SL1|MON|1600|1800|LT27|1_2_3_4_5_6_7_8_9_10_11_12_13'];

    const semTimetableConfig: SemTimetableConfig = {
      [GES1021.moduleCode]: {
        Lecture: timetableLessonIds,
      },
    };

    const timetableLessons: SemTimetableConfigWithLessons<Lesson> = hydrateSemTimetableWithLessons(
      semTimetableConfig,
      modules,
      semester,
    );

    const readOnly = false;
    const isTaInTimetable = (moduleCode: ModuleCode) => moduleCode === GES1021.moduleCode;

    describe('when no lessons are active', () => {
      const activeLesson = null;

      const hydratedLessons: SemTimetableConfigWithLessons<InteractableLesson> =
        getInteractableLessons(
          timetableLessons,
          modules,
          semester,
          colors,
          readOnly,
          isTaInTimetable,
          activeLesson,
        );

      const hydratedLessonsArray: InteractableLesson[] = timetableLessonsArray(hydratedLessons);

      test('only the lesson in the timetable are visible', () => {
        expect(lessonIds(hydratedLessonsArray)).toEqual(
          lessonIds(timetableLessonsArray(timetableLessons)),
        );
      });

      test('lesson is already in timetable', () => {
        expect(some(hydratedLessonsArray, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(false);
      });
    });

    describe('when a lesson is active', () => {
      const activeLesson: Lesson = get(timetableLessons, [
        GES1021.moduleCode,
        'Lecture',
        'SL1|MON|1600|1800|LT27|1_2_3_4_5_6_7_8_9_10_11_12_13',
      ]);

      const hydratedLessons: SemTimetableConfigWithLessons<InteractableLesson> =
        getInteractableLessons(
          timetableLessons,
          modules,
          semester,
          colors,
          readOnly,
          isTaInTimetable,
          activeLesson,
        );

      const hydratedLessonsArray: InteractableLesson[] = timetableLessonsArray(hydratedLessons);

      test('all lessons from the module are visible', () => {
        expect(lessonIds(hydratedLessonsArray)).toEqual(
          lessonIds(getModuleTimetable(GES1021, semester)),
        );
      });

      test('lesson already in timetable are already in the lesson config', () => {
        const hydratedTimetableLessons: InteractableLesson[] = filter(
          hydratedLessonsArray,
          (lesson) => timetableLessonIds.includes(serializeLessonDetails(lesson)),
        );

        expect(some(hydratedTimetableLessons, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(
          false,
        );
      });

      test('lesson not in timetable can be added to the lesson config', () => {
        const hydratedNonTimetableLessonsArray: InteractableLesson[] = filter(
          hydratedLessonsArray,
          (lesson) => !timetableLessonIds.includes(serializeLessonDetails(lesson)),
        );

        expect(
          some(hydratedNonTimetableLessonsArray, (lesson) => !lesson.canBeAddedToLessonConfig),
        ).toBe(false);
      });
    });
  });

  describe('hydrating modules in a readonly timetable', () => {
    const semTimetableConfig: SemTimetableConfig = {
      [PC1222.moduleCode]: {
        Laboratory: ['F01|FRI|1400|1700|S12-0402|3_5_7_9_11'],
        Lecture: ['SL1|TUE|1200|1400|LT25|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        Tutorial: ['T1|MON|1600|1700|S11-0204|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      },
      [CS4243.moduleCode]: {
        Laboratory: ['1|TUE|1400|1600|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
        Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      },
    };

    const timetableLessons: SemTimetableConfigWithLessons<Lesson> = hydrateSemTimetableWithLessons(
      semTimetableConfig,
      modules,
      semester,
    );

    const readOnly = true;
    const activeLesson = null; // lessons cannot be selected as active in a readonly timetable

    const hydratedLessons: SemTimetableConfigWithLessons<InteractableLesson> =
      getInteractableLessons(
        timetableLessons,
        modules,
        semester,
        colors,
        readOnly,
        (moduleCode: ModuleCode) => moduleCode === PC1222.moduleCode,
        activeLesson,
      );

    const hydratedLessonsArray: InteractableLesson[] = timetableLessonsArray(hydratedLessons);

    test('lessons in readonly timetable cannot be select as active lesson', () => {
      expect(some(hydratedLessonsArray, (lesson) => lesson.canBeSelectedAsActiveLesson)).toBe(
        false,
      );
    });

    test('lessons from ta modules are marked as ta in timetable', () => {
      const hydratedTaModuleLessonsArray: InteractableLesson[] = flatMap(
        get(hydratedLessons, PC1222.moduleCode),
        (lessons) => values(lessons),
      );

      expect(some(hydratedTaModuleLessonsArray, (lesson) => !lesson.isTaInTimetable)).toBe(false);
    });

    test('lessons from non-ta modules are marked as not ta in timetable', () => {
      const hydratedNonTaModuleLessonsArray: InteractableLesson[] = flatMap(
        get(hydratedLessons, CS4243.moduleCode),
        (lessons) => values(lessons),
      );

      expect(some(hydratedNonTaModuleLessonsArray, (lesson) => lesson.isTaInTimetable)).toBe(false);
    });

    test('readonly timetables should only show the lessons in the timetable', () => {
      expect(lessonIds(hydratedLessonsArray)).toEqual(
        lessonIds(timetableLessonsArray(timetableLessons)),
      );
    });

    test('readonly timetables keep timetable lessons locked in the config', () => {
      expect(some(hydratedLessonsArray, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(false);
    });
  });
});
