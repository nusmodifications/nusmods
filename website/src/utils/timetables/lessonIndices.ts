import {
  entries,
  filter,
  first,
  get,
  groupBy,
  intersection,
  map,
  mapValues,
  maxBy,
  pick,
  reduce,
  values,
} from 'lodash-es';
import {
  ClassNo,
  LessonIndex,
  LessonIndicesMap,
  LessonType,
  Module,
  RawLessonWithIndex,
} from 'types/modules';
import { ModulesMap } from 'types/reducers';
import { ModuleLessonConfig } from 'types/timetables';

/**
 * Used to recover from the config of a lesson type that contains invalid lesson indices
 * @param lessonsWithLessonType lessons with the same lesson type to generate a valid lesson config from
 * @returns lesson indices of the generated valid lesson config
 *
 * Note: the current implementation generates a config containing lessons belonging to the first classNo in the provided lessons
 */
export function getRecoveryLessonIndices(
  lessonsWithLessonType: RawLessonWithIndex[],
): LessonIndex[] {
  const firstClass = first(lessonsWithLessonType);
  if (!firstClass) {
    return [];
  }
  const { classNo } = firstClass;
  const validLessonIndices = map(
    filter(lessonsWithLessonType, (lesson) => lesson.classNo === classNo),
    'lessonIndex',
  );
  return validLessonIndices;
}

/**
 * Group lessons by lesson types then classNo
 * @param lessonsWithIndex lessons to group
 * @returns lesson indices, not lessons
 */
export const makeLessonIndicesMap = (
  lessonsWithIndex: readonly RawLessonWithIndex[],
): LessonIndicesMap => {
  const lessonsByLessonType = groupBy(lessonsWithIndex, 'lessonType');
  return mapValues(lessonsByLessonType, (lessonsWithLessonType) => {
    const lessonsByClassNo = groupBy(lessonsWithLessonType, 'classNo');
    return mapValues(lessonsByClassNo, (lessonsWithClassNo) =>
      map(lessonsWithClassNo, 'lessonIndex'),
    );
  });
};

/**
 * Helper function to return the indices of lessons belonging to the {@link LessonType|lesson type} and {@link ClassNo|classNo} in the {@link LessonIndicesMap|lesson index mapping}
 * @param lessonIndicesMap
 * @param lessonType
 * @param classNo
 */
export const getLessonIndices = (
  lessonIndicesMap: LessonIndicesMap,
  lessonType: LessonType,
  classNo: ClassNo,
): LessonIndex[] => get(get(lessonIndicesMap, lessonType), classNo);

// Get information for all modules present in a semester timetable config
export function getSemesterModules(
  timetable: { [moduleCode: string]: unknown },
  modules: ModulesMap,
): Module[] {
  return values(pick(modules, Object.keys(timetable)));
}

/**
 * Based on what lessons are currently in the lesson config, find the classNo that most of the lessons belong to
 * @param lessonIndicesMap {@link LessonIndicesMap|Lesson indices mapping} of the module
 * @param timetableLessonIndices lessons currently in lesson config
 * @returns a lesson config consisting of lesson indices that best matches the TA lesson config
 */
export function getClosestLessonConfig(
  lessonIndicesMap: LessonIndicesMap,
  timetableLessonIndices: ModuleLessonConfig,
): ModuleLessonConfig {
  return reduce(
    lessonIndicesMap,
    (accumulatedModuleLessonConfig, lessonsWithLessonType, lessonType) => {
      const timetableLessonsWithLessonType = timetableLessonIndices[lessonType];
      const lessonGroupOccurrences = entries(
        reduce(
          lessonsWithLessonType,
          (accumulated, lessonIndices, lessonGroup) => ({
            ...accumulated,
            [lessonGroup]: intersection(lessonIndices, timetableLessonsWithLessonType).length,
          }),
          {} as Record<ClassNo, number>,
        ),
      );

      const closestLessonGroups = maxBy(lessonGroupOccurrences, ([, occurrences]) => occurrences);
      if (!closestLessonGroups) return accumulatedModuleLessonConfig;
      const [closestLessonGroupKey] = closestLessonGroups;
      const closestLessonGroup = getLessonIndices(
        lessonIndicesMap,
        lessonType,
        closestLessonGroupKey,
      );

      return {
        ...accumulatedModuleLessonConfig,
        [lessonType]: closestLessonGroup,
      };
    },
    {} as ModuleLessonConfig,
  );
}
