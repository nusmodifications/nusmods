import { filter, groupBy, map, mapValues, partition } from 'lodash-es';

import { LessonIndex, LessonType, ModuleCode, RawLesson, Semester } from 'types/modules';

import { ColoredLesson, InteractableLesson, LessonWithIndex } from 'types/timetables';

import { ColorMapping, ModulesMap } from 'types/reducers';
import { getModuleTimetable } from 'utils/modules';

// Determines if a Lesson on the timetable can be modifiable / dragged around.
// Condition: There are multiple ClassNo for all the Array<Lesson> in a lessonType.
export function areOtherClassesAvailable(
  lessons: readonly RawLesson[],
  lessonType: LessonType,
): boolean {
  const lessonTypeGroups = groupBy<RawLesson>(lessons, (lesson) => lesson.lessonType);
  if (!lessonTypeGroups[lessonType]) {
    // No such lessonType.
    return false;
  }
  return Object.keys(groupBy(lessonTypeGroups[lessonType], (lesson) => lesson.classNo)).length > 1;
}

/**
 * Differentiates between ColoredLesson and InteractableLesson
 * @param lesson Must be a ColoredLesson or InteractableLesson
 */
export function isInteractable(
  lesson: ColoredLesson | InteractableLesson,
): lesson is InteractableLesson {
  return 'lessonIndex' in lesson;
}

/**
 * Hydrate timetable lessons with interactability info\
 * See type defintion of {@link InteractableLesson} for properties added
 */
export function getInteractableLessons(
  timetableLessons: LessonWithIndex[],
  modules: ModulesMap,
  semester: Semester,
  colors: ColorMapping,
  readOnly: boolean,
  isTaInTimetable: (moduleCode: ModuleCode) => boolean,
  activeLesson: LessonWithIndex | null,
): InteractableLesson[] {
  if (!activeLesson)
    return hydrateInteractability(
      timetableLessons,
      modules,
      semester,
      colors,
      readOnly,
      isTaInTimetable,
    );

  const activeModuleCode: ModuleCode = activeLesson.moduleCode;
  const activeModule = modules[activeModuleCode];
  const activeModuleLessons = getModuleTimetable(activeModule, semester);
  const selectableLessons = isTaInTimetable(activeModuleCode)
    ? activeModuleLessons
    : filter(activeModuleLessons, (lesson) => lesson.lessonType === activeLesson.lessonType);
  const selectableLessonsWithModuleCodeAndTitle = map(selectableLessons, (lesson) => ({
    ...lesson,
    moduleCode: activeModuleCode,
    title: activeModule.title,
  }));

  const [timetableLessonsInSelectableLessons, timetableLessonsNotInSelectableLessons] =
    isTaInTimetable(activeModuleCode)
      ? partition(timetableLessons, (lesson) => lesson.moduleCode === activeModuleCode)
      : partition(
          timetableLessons,
          (lesson) =>
            lesson.moduleCode === activeModuleCode && lesson.lessonType === activeLesson.lessonType,
        );
  const selectedLessonIndices = map(timetableLessonsInSelectableLessons, 'lessonIndex');

  return [
    ...hydrateInteractability(
      selectableLessonsWithModuleCodeAndTitle,
      modules,
      semester,
      colors,
      readOnly,
      isTaInTimetable,
      activeLesson,
      selectedLessonIndices,
    ),
    ...hydrateInteractability(
      timetableLessonsNotInSelectableLessons,
      modules,
      semester,
      colors,
      readOnly,
      isTaInTimetable,
    ),
  ];
}

/**
 * Hydrates a list of lessons to add interactability info\
 * See type defintion of {@link InteractableLesson} for properties added
 */
export function hydrateInteractability(
  timetableLessons: LessonWithIndex[],
  modules: ModulesMap,
  semester: Semester,
  colors: ColorMapping,
  readOnly: boolean,
  isTaInTimetable: (moduleCode: ModuleCode) => boolean,
  activeLesson?: LessonWithIndex,
  alreadySelectedLessonIndices?: LessonIndex[],
): InteractableLesson[] {
  const moduleTimetables = mapValues(modules, (module) => getModuleTimetable(module, semester));

  return map(timetableLessons, (lesson) => {
    const { moduleCode, lessonType, classNo, lessonIndex } = lesson;
    const isSameModule = moduleCode === activeLesson?.moduleCode;
    const isSameLessonType = lessonType === activeLesson?.lessonType;

    const isActive = isSameModule && isSameLessonType && lessonIndex === activeLesson?.lessonIndex;
    const moduleIsTaInTimetable = isTaInTimetable(moduleCode);
    const canBeSelectedAsActiveLesson =
      !readOnly &&
      (moduleIsTaInTimetable
        ? true
        : areOtherClassesAvailable(moduleTimetables[moduleCode], lessonType));

    const alreadyAddedToLessonConfig = alreadySelectedLessonIndices?.includes(lesson.lessonIndex);
    const isSameLessonGroupAsActiveLesson = moduleIsTaInTimetable
      ? lessonIndex === activeLesson?.lessonIndex
      : classNo === activeLesson?.classNo;
    const canBeAddedToLessonConfig =
      isSameModule &&
      (moduleIsTaInTimetable ? true : isSameLessonType) &&
      !alreadyAddedToLessonConfig &&
      !isSameLessonGroupAsActiveLesson;

    return {
      ...lesson,
      isActive,
      isTaInTimetable: moduleIsTaInTimetable,
      canBeAddedToLessonConfig,
      canBeSelectedAsActiveLesson,
      colorIndex: colors[moduleCode],
    };
  });
}
