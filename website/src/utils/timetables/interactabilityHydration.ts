import { get, groupBy, keys, mapValues } from 'lodash-es';

import {
  LessonId,
  LessonType,
  ModuleCode,
  ModuleLessonMap,
  RawLesson,
  Semester,
} from 'types/modules';

import {
  ColoredLesson,
  InteractableLesson,
  Lesson,
  SemTimetableConfigWithLessons,
} from 'types/timetables';

import { ColorMapping, ModulesMap } from 'types/reducers';
import { getModuleLessonMap, getModuleTimetable } from 'utils/modules';
import { serializeLessonDetails } from './lessonId';

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
  return 'canBeSelectedAsActiveLesson' in lesson;
}

/**
 * Hydrate timetable lessons with interactability info\
 * See type defintion of {@link InteractableLesson} for properties added
 */
export function getInteractableLessons(
  timetableLessons: SemTimetableConfigWithLessons<Lesson>,
  modules: ModulesMap,
  semester: Semester,
  colors: ColorMapping,
  readOnly: boolean,
  isTaInTimetable: (moduleCode: ModuleCode) => boolean,
  activeLesson: Lesson | null,
): SemTimetableConfigWithLessons<InteractableLesson> {
  const moduleTimetables: Record<ModuleCode, readonly RawLesson[]> = mapValues(modules, (module) =>
    getModuleTimetable(module, semester),
  );
  const activeLessonId: LessonId | null = activeLesson
    ? serializeLessonDetails(activeLesson)
    : null;

  return mapValues(
    timetableLessons,
    (lessonMap: ModuleLessonMap<Lesson>, moduleCode: ModuleCode) => {
      const moduleIsTaInTimetable: boolean = isTaInTimetable(moduleCode);

      return mapValues(
        lessonMap,
        (
          lessonsWithLessonType: Record<LessonId, Lesson>,
          lessonType: LessonType,
        ): { [lessonId: LessonId]: InteractableLesson } => {
          const isSameModule: boolean = moduleCode === activeLesson?.moduleCode;
          const isSameLessonType: boolean = lessonType === activeLesson?.lessonType;

          const configLessonIds: Set<LessonId> = new Set(keys(lessonsWithLessonType));
          const lessons: Record<LessonId, RawLesson> =
            activeLesson && isSameModule && (moduleIsTaInTimetable || isSameLessonType)
              ? get(getModuleLessonMap(get(modules, moduleCode), semester), lessonType)
              : lessonsWithLessonType;

          return mapValues(lessons, (lesson, lessonId: LessonId): InteractableLesson => {
            const isActive = isSameModule && isSameLessonType && lessonId === activeLessonId;
            const canBeSelectedAsActiveLesson =
              !readOnly &&
              (moduleIsTaInTimetable ||
                areOtherClassesAvailable(moduleTimetables[moduleCode], lessonType));

            const alreadyAddedToLessonConfig: boolean = configLessonIds.has(lessonId);
            const isSameLessonGroupAsActiveLesson: boolean = moduleIsTaInTimetable
              ? isActive
              : lesson.classNo === activeLesson?.classNo;
            const canBeAddedToLessonConfig =
              isSameModule &&
              (moduleIsTaInTimetable || isSameLessonType) &&
              !alreadyAddedToLessonConfig &&
              !isSameLessonGroupAsActiveLesson;

            return {
              ...lesson,
              moduleCode,
              title: modules[moduleCode].title,
              isActive,
              isTaInTimetable: moduleIsTaInTimetable,
              canBeAddedToLessonConfig,
              canBeSelectedAsActiveLesson,
              colorIndex: colors[moduleCode],
              lessonId,
            };
          });
        },
      );
    },
  );
}
