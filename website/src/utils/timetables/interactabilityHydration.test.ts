import { filter, find, map, mapValues, shuffle, some } from 'lodash-es';
import { LessonWithIndex, InteractableLesson } from 'types/timetables';
import { LessonIndex, ModuleCode, RawLesson } from 'types/modules';

import { getModuleTimetable } from 'utils/modules';

import { CS4243, PC1222, GES1021 } from '__mocks__/modules';
import { createGenericLesson } from 'test-utils/timetable';

import { areOtherClassesAvailable, getInteractableLessons } from './interactabilityHydration';

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

  const lessonsMap: Record<ModuleCode, LessonWithIndex[]> = mapValues(modules, (module) =>
    map(getModuleTimetable(module, semester), (lesson) => ({
      ...lesson,
      moduleCode: module.moduleCode,
      title: module.title,
    })),
  );

  const getLesson = (moduleCode: ModuleCode, lessonIndex: LessonIndex): LessonWithIndex => {
    const lessonWithIndex = find(
      lessonsMap[moduleCode],
      (lesson) => lesson.lessonIndex === lessonIndex,
    );
    if (!lessonWithIndex) throw new Error('No lesson found with this lesson index');
    return lessonWithIndex;
  };

  const getLessons = (moduleCode: ModuleCode, lessonIndices: LessonIndex[]): LessonWithIndex[] =>
    filter(lessonsMap[moduleCode], (lesson) => lessonIndices.includes(lesson.lessonIndex));

  const getHydratedLesson = (hydratedLessons: InteractableLesson[], lesson: LessonWithIndex) =>
    find(
      hydratedLessons,
      (hydratedLesson) =>
        hydratedLesson.moduleCode === lesson.moduleCode &&
        hydratedLesson.lessonIndex === lesson.lessonIndex,
    );

  describe('hydrating modules when there is no active lesson', () => {
    const taModuleLessons = getLessons(PC1222.moduleCode, [0, 1, 10, 11, 12, 13]);

    const lessonWithAlternative = getLesson(CS4243.moduleCode, 0);
    const lessonWithNoAlternative = getLesson(CS4243.moduleCode, 5);

    const timetableLessons: LessonWithIndex[] = [
      ...taModuleLessons,
      lessonWithAlternative,
      lessonWithNoAlternative,
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

    test('all lessons are marked as non active because there is no active lesson', () => {
      expect(some(hydratedLessons, (lesson) => lesson.isActive)).toBe(false);
    });

    test('when there are no active lessons, only lessons that are in timetable are present, they cannot be added to lesson config', () => {
      expect(some(hydratedLessons, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(false);
    });

    test('lessons from ta module are marked as ta in timetable', () => {
      const lessonsFromTaModule = filter(
        hydratedLessons,
        (lesson) => lesson.moduleCode === PC1222.moduleCode,
      );
      expect(some(lessonsFromTaModule, (lesson) => !lesson.isTaInTimetable)).toBe(false);
    });

    test('lessons from non-ta module are marked as not ta in timetable', () => {
      const lessonsFromNonTaModule = filter(
        hydratedLessons,
        (lesson) => lesson.moduleCode === CS4243.moduleCode,
      );
      expect(some(lessonsFromNonTaModule, (lesson) => lesson.isTaInTimetable)).toBe(false);
    });

    test('hydration of lessons with alternative lessons', () => {
      expect(
        getHydratedLesson(hydratedLessons, lessonWithAlternative)?.canBeSelectedAsActiveLesson,
      ).toBe(true);
    });

    test('hydration of lessons with no alternative lessons', () => {
      expect(
        getHydratedLesson(hydratedLessons, lessonWithNoAlternative)?.canBeSelectedAsActiveLesson,
      ).toBe(false);
    });

    test('should only show lessons in timetable when no lesson is active', () => {
      expect(hydratedLessons).toHaveLength(timetableLessons.length);
    });
  });

  describe('hydrating modules when there is an active lesson from a non-ta module', () => {
    const activeLesson = getLesson(PC1222.moduleCode, 0);

    const otherLessons = getLessons(PC1222.moduleCode, [10, 12]);

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

    const hydratedActiveLesson = getHydratedLesson(hydratedLessons, activeLesson);

    test('active lesson should be marked as active', () => {
      expect(hydratedActiveLesson?.isActive).toBe(true);
    });

    test('active lesson is already in lesson config', () => {
      expect(hydratedActiveLesson?.canBeAddedToLessonConfig).toBe(false);
    });

    const hydratedAlternativeLessons = filter(
      hydratedLessons,
      (lesson) =>
        lesson.lessonType === activeLesson.lessonType && lesson.classNo !== activeLesson.classNo,
    );

    test('alternative lessons can be added to the lesson config', () => {
      expect(some(hydratedAlternativeLessons, (lesson) => !lesson.canBeAddedToLessonConfig)).toBe(
        false,
      );
    });

    test('all alternative lessons are displayed', () => {
      const alternativeLessons = filter(
        lessonsMap[PC1222.moduleCode],
        (lesson) =>
          lesson.lessonType === activeLesson.lessonType && lesson.classNo !== activeLesson.classNo,
      );
      const indicesOfAlternativeLessons = new Set(map(alternativeLessons, 'lessonIndex'));
      const indicesOfHydratedAlternativeLessons = new Set(
        map(hydratedAlternativeLessons, 'lessonIndex'),
      );

      expect(indicesOfAlternativeLessons).toEqual(indicesOfHydratedAlternativeLessons);
    });
  });

  describe('hydrating modules when there is an active lesson from a ta module', () => {
    const lessonsFromOtherModule = getLessons(PC1222.moduleCode, [0, 10, 12]);

    const activeLesson = getLesson(CS4243.moduleCode, 0);
    const lessonsFromActiveModule = getLessons(CS4243.moduleCode, [1, 2, 5]);

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

    const hydratedOtherModuleLessons = filter(
      hydratedLessons,
      (lesson) => lesson.moduleCode !== activeLesson.moduleCode,
    );

    test('lessons that are not from the same module as the active lesson cannot be added', () => {
      expect(some(hydratedOtherModuleLessons, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(
        false,
      );
    });

    test('timetable lessons from other modules are visible', () => {
      const otherModuleLessons = filter(
        timetableLessons,
        (lesson) => lesson.moduleCode !== activeLesson.moduleCode,
      );
      const indicesOfOtherModuleLessons = new Set(map(otherModuleLessons, 'lessonIndex'));
      const indicesOfHydratedOtherModuleLessons = new Set(
        map(hydratedOtherModuleLessons, 'lessonIndex'),
      );

      expect(indicesOfHydratedOtherModuleLessons).toEqual(indicesOfOtherModuleLessons);
    });

    const hydratedActiveLesson = getHydratedLesson(hydratedLessons, activeLesson);

    test('active lesson should be marked as active', () => {
      expect(hydratedActiveLesson?.isActive).toBe(true);
    });

    test('active lesson is already in lesson config', () => {
      expect(hydratedActiveLesson?.canBeAddedToLessonConfig).toBe(false);
    });

    const hydratedActiveModuleLessons = filter(
      hydratedLessons,
      (lesson) => lesson.moduleCode === activeLesson.moduleCode,
    );

    test('all lessons of a ta module are interactable', () => {
      expect(
        some(hydratedActiveModuleLessons, (lesson) => !lesson.canBeSelectedAsActiveLesson),
      ).toBe(false);
    });

    test("all lessons from the active lesson's module should be visible, currently selected lessons and active lesson should not appear twice", () => {
      expect(hydratedActiveModuleLessons).toHaveLength(6);
    });

    const hydratedAlternativeLessons = filter(
      hydratedActiveModuleLessons,
      (lesson) =>
        lesson.lessonType === activeLesson.lessonType && lesson.classNo !== activeLesson.classNo,
    );

    test('alternative lessons in timetable are already added to the lesson config', () => {
      const alternativeLessonsInTimetable = filter(hydratedAlternativeLessons, (lesson) =>
        [0, 1, 2].includes(lesson.lessonIndex),
      );

      expect(some(alternativeLessonsInTimetable, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(
        false,
      );
    });

    test('alternative lessons not in timetable can be added to the lesson config', () => {
      const alternativeLessonsNotInTimetable = filter(
        hydratedAlternativeLessons,
        (lesson) => ![0, 1, 2].includes(lesson.lessonIndex),
      );

      expect(
        some(alternativeLessonsNotInTimetable, (lesson) => !lesson.canBeAddedToLessonConfig),
      ).toBe(false);
    });

    test('all alternative lessons are displayed', () => {
      const alternativeLessons = filter(
        lessonsMap[CS4243.moduleCode],
        (lesson) =>
          lesson.lessonType === activeLesson.lessonType && lesson.classNo !== activeLesson.classNo,
      );
      const indicesOfAlternativeLessons = new Set(map(alternativeLessons, 'lessonIndex'));
      const indicesOfHydratedAlternativeLessons = new Set(
        map(hydratedAlternativeLessons, 'lessonIndex'),
      );

      expect(indicesOfAlternativeLessons).toEqual(indicesOfHydratedAlternativeLessons);
    });
  });

  describe('hydrating non-ta module containing multiple lessons with the same classNo', () => {
    const timetableLessons = getLessons(GES1021.moduleCode, [0, 1]);

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

    test('lessons in timetable are already added to lesson config', () => {
      expect(some(hydratedLessons, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(false);
    });

    test('should only show lessons in timetable when no lesson is active', () => {
      expect(hydratedLessons).toHaveLength(timetableLessons.length);
    });
  });

  describe('hydrating ta module containing multiple lessons with the same classNo', () => {
    const timetableLessons = getLessons(GES1021.moduleCode, [0]);

    const isTaInTimetable = getIsTaInTimetable([GES1021.moduleCode]);
    const readOnly = false;

    describe('when no lessons are active', () => {
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

      test('only the lesson in the timetable are visible', () => {
        expect(hydratedLessons).toHaveLength(1);
      });

      test('lesson is already in timetable', () => {
        expect(some(hydratedLessons, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(false);
      });
    });

    describe('when a lesson is active', () => {
      const activeLesson = getLesson(GES1021.moduleCode, 0);

      const hydratedLessons = getInteractableLessons(
        timetableLessons,
        modules,
        semester,
        colors,
        readOnly,
        isTaInTimetable,
        activeLesson,
      );

      test('all lessons from the module are visible', () => {
        expect(hydratedLessons).toHaveLength(2);
      });

      test('lesson already in timetable are already in the lesson config', () => {
        const hydratedLessonInTimetable = filter(hydratedLessons, (lesson) =>
          [0].includes(lesson.lessonIndex),
        );

        expect(some(hydratedLessonInTimetable, (lesson) => lesson.canBeAddedToLessonConfig)).toBe(
          false,
        );
      });

      test('lesson not in timetable can be added to the lesson config', () => {
        const hydratedLessonInTimetable = filter(
          hydratedLessons,
          (lesson) => ![0].includes(lesson.lessonIndex),
        );

        expect(some(hydratedLessonInTimetable, (lesson) => !lesson.canBeAddedToLessonConfig)).toBe(
          false,
        );
      });
    });
  });

  describe('hydrating modules in a readonly timetable', () => {
    const taModuleLessons = getLessons(PC1222.moduleCode, [0, 10, 12]);

    const nonTaModuleLessons = getLessons(CS4243.moduleCode, [0, 5]);

    const timetableLessons = [...taModuleLessons, ...nonTaModuleLessons];

    const isTaInTimetable = getIsTaInTimetable([PC1222.moduleCode]);
    const readOnly = true;
    const activeLesson = null; // lessons cannot be selected as active in a readonly timetable

    const hydratedLessons = getInteractableLessons(
      timetableLessons,
      modules,
      semester,
      colors,
      readOnly,
      isTaInTimetable,
      activeLesson,
    );

    test('lessons in readonly timetable cannot be select as active lesson', () => {
      expect(some(hydratedLessons, (lesson) => lesson.canBeSelectedAsActiveLesson)).toBe(false);
    });

    test('lessons from ta modules are marked as ta in timetable', () => {
      const hydratedTaModuleLessons = filter(
        hydratedLessons,
        (lesson) => lesson.moduleCode === PC1222.moduleCode,
      );

      expect(some(hydratedTaModuleLessons, (lesson) => !lesson.isTaInTimetable)).toBe(false);
    });

    test('lessons from non-ta modules are marked as not ta in timetable', () => {
      const hydratedTaModuleLessons = filter(
        hydratedLessons,
        (lesson) => lesson.moduleCode === CS4243.moduleCode,
      );

      expect(some(hydratedTaModuleLessons, (lesson) => lesson.isTaInTimetable)).toBe(false);
    });

    test('readonly timetables should only show the lessons in the timetable', () => {
      expect(hydratedLessons).toHaveLength(timetableLessons.length);
    });
  });
});
