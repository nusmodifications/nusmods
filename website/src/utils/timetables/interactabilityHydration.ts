import { get, groupBy, keys, mapValues, size } from 'lodash-es';

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
import { getModuleLessonMap } from 'utils/modules';
import { serializeLessonDetails } from './lessonId';

/**
 * Factors that are used to hydrate interactability shared across all modules in the timetable
 */
type TimetableInteractabilityProps = {
  activeLesson: Lesson | null;
  activeLessonId: LessonId | null;
  modules: ModulesMap;
  semester: Semester;
  colors: ColorMapping;
  readOnly: boolean;
};

/**
 * Factors that are used to hydrate interactability shared across all lessons in a module
 */
type ModuleInteractabilityProps = {
  moduleCode: ModuleCode;
  moduleIsTaInTimetable: boolean;
};

/**
 * Factors that are used to hydrate interactability shared across all lessons in a module of the same lesson type
 */
type LessonTypeInteractabilityProps = {
  areOtherClassesAvailable: boolean;
  configLessonTypeLessonIds: Set<LessonId>;
  isSameModuleAsActiveLesson: boolean;
  isSameLessonTypeAsActiveLesson: boolean;
};

/**
 * Determines if a Lesson on the timetable can be modifiable / dragged around
 * Other classes are available if there are multiple ClassNo in the provided lessons
 * @param lessonTypeLessons
 */
export function areOtherClassesAvailable(lessonTypeLessons: Record<LessonId, RawLesson>): boolean {
  return size(groupBy(lessonTypeLessons, 'classNo')) > 1;
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
 * Determines which lessons can be added to the config\
 * When there are no active lessons, or if the active lesson is from another module,
 * clicking a lesson will make it the active lesson, not add it to the config\
 * If the module is a non-TA module and the lesson has the same `ClassNo` from the active lesson, the lesson cannot be added\
 * If the module is a TA-module, and the lesson is already in the config, it cannot be added
 * @param lesson to check
 * @param isActive whether the lesson to check is the active lesson
 */
function canBeAddedToLessonConfig(
  lesson: RawLesson,
  isSameModuleAsActiveLesson: boolean,
  isSameLessonTypeAsActiveLesson: boolean,
  alreadyAddedToLessonConfig: boolean,
  moduleIsTaInTimetable: boolean,
  activeLesson: Lesson | null,
) {
  if (!activeLesson || !isSameModuleAsActiveLesson || alreadyAddedToLessonConfig) return false;

  if (!moduleIsTaInTimetable) return lesson.classNo !== activeLesson.classNo;

  return moduleIsTaInTimetable || isSameLessonTypeAsActiveLesson;
}

/**
 * Helper function for {@link getLessonTypeInteractableLessons|getLessonTypeInteractableLessons}
 * Hydrate lesson with interactability info\
 * See type defintion of {@link InteractableLesson} for properties added
 */
function hydrateLessonInteractability({
  lesson,
  lessonId,
  timetableInteractabilityProps: { activeLesson, activeLessonId, modules, colors, readOnly },
  moduleInteractabilityProps: { moduleCode, moduleIsTaInTimetable },
  lessonTypeInteractabilityProps: {
    areOtherClassesAvailable,
    configLessonTypeLessonIds,
    isSameLessonTypeAsActiveLesson,
    isSameModuleAsActiveLesson,
  },
}: {
  lesson: Readonly<RawLesson>;
  lessonId: LessonId;
  timetableInteractabilityProps: TimetableInteractabilityProps;
  moduleInteractabilityProps: ModuleInteractabilityProps;
  lessonTypeInteractabilityProps: LessonTypeInteractabilityProps;
}): InteractableLesson {
  const isActive: boolean =
    isSameModuleAsActiveLesson && isSameLessonTypeAsActiveLesson && lessonId === activeLessonId;
  const canBeSelectedAsActiveLesson: boolean =
    !readOnly && (moduleIsTaInTimetable || areOtherClassesAvailable);
  const alreadyAddedToLessonConfig: boolean = configLessonTypeLessonIds.has(lessonId);

  return {
    ...lesson,
    moduleCode,
    title: modules[moduleCode].title,
    isActive,
    isTaInTimetable: moduleIsTaInTimetable,
    canBeAddedToLessonConfig: canBeAddedToLessonConfig(
      lesson,
      isSameModuleAsActiveLesson,
      isSameLessonTypeAsActiveLesson,
      alreadyAddedToLessonConfig,
      moduleIsTaInTimetable,
      activeLesson,
    ),
    canBeSelectedAsActiveLesson,
    colorIndex: colors[moduleCode],
    lessonId,
  };
}

/**
 * Helper function for {@link getLessonTypeInteractableLessons|getLessonTypeInteractableLessons}
 * Determines what lessons from the lesson type should be shown
 * If active lesson is not from this module, only show the lessons in the config
 * If active lesson is from this module, and
 * - module is non-TA, only show the lessons from the lesson type of the active lesson
 * - module is TA, show all lessons from all lesson types of this module
 */
function getVisibleLessons(
  configLessonTypeLessons: Record<LessonId, Lesson>,
  lessonTypeLessons: Record<LessonId, RawLesson>,
  isSameModuleAsActiveLesson: boolean,
  isSameLessonTypeAsActiveLesson: boolean,
  moduleIsTaInTimetable: boolean,
  activeLesson: Lesson | null,
): Record<LessonId, RawLesson> {
  if (!activeLesson || !isSameModuleAsActiveLesson) return configLessonTypeLessons;

  if (moduleIsTaInTimetable || isSameLessonTypeAsActiveLesson) return lessonTypeLessons;

  return configLessonTypeLessons;
}

/**
 * Helper function for {@link getModuleInteractableLessons|getModuleInteractableLessons}\
 * Hydrate lessons with interactability info for a single `LessonType` of a `Module`
 */
function getLessonTypeInteractableLessons({
  configLessonTypeLessons,
  lessonType,
  lessonTypeLessons,
  timetableInteractabilityProps,
  moduleInteractabilityProps,
}: {
  configLessonTypeLessons: Record<LessonId, Lesson>;
  lessonType: LessonType;
  lessonTypeLessons: Record<LessonId, RawLesson>;
  timetableInteractabilityProps: TimetableInteractabilityProps;
  moduleInteractabilityProps: ModuleInteractabilityProps;
}): Record<LessonId, InteractableLesson> {
  const { activeLesson } = timetableInteractabilityProps;
  const { moduleCode, moduleIsTaInTimetable } = moduleInteractabilityProps;

  const isSameModuleAsActiveLesson: boolean = moduleCode === activeLesson?.moduleCode;
  const isSameLessonTypeAsActiveLesson: boolean = lessonType === activeLesson?.lessonType;

  const configLessonTypeLessonIds: Set<LessonId> = new Set(keys(configLessonTypeLessons));

  const visibleLessons: Record<LessonId, RawLesson> = getVisibleLessons(
    configLessonTypeLessons,
    lessonTypeLessons,
    isSameModuleAsActiveLesson,
    isSameLessonTypeAsActiveLesson,
    moduleIsTaInTimetable,
    activeLesson,
  );

  return mapValues<Record<LessonId, Readonly<RawLesson>>, InteractableLesson>(
    visibleLessons,
    (lesson, lessonId: LessonId) =>
      hydrateLessonInteractability({
        lesson,
        lessonId,
        timetableInteractabilityProps,
        moduleInteractabilityProps,
        lessonTypeInteractabilityProps: {
          areOtherClassesAvailable: areOtherClassesAvailable(lessonTypeLessons),
          configLessonTypeLessonIds,
          isSameLessonTypeAsActiveLesson,
          isSameModuleAsActiveLesson,
        },
      }),
  );
}

/**
 * Helper function for {@link getInteractableLessons|getInteractableLessons}\
 * Get interactable lessons for a single `Module`\
 * @param configModuleLessonMap {@link ModuleLessonMap|ModuleLessonMap} of the lessons in the config
 * @param moduleLessonMap {@link ModuleLessonMap|ModuleLessonMap} of all lessons in the module
 */
function getModuleInteractableLessons({
  configModuleLessonMap,
  moduleCode,
  moduleLessonMap,
  timetableInteractabilityProps,
  isTaInTimetable,
}: {
  configModuleLessonMap: ModuleLessonMap<Lesson>;
  moduleCode: ModuleCode;
  moduleLessonMap: ModuleLessonMap<RawLesson>;
  timetableInteractabilityProps: TimetableInteractabilityProps;
  isTaInTimetable: (moduleCode: ModuleCode) => boolean;
}): Record<LessonType, Record<LessonId, InteractableLesson>> {
  const moduleIsTaInTimetable: boolean = isTaInTimetable(moduleCode);

  return mapValues(
    configModuleLessonMap,
    (configLessonTypeLessons: Record<LessonId, Lesson>, lessonType: LessonType) =>
      getLessonTypeInteractableLessons({
        configLessonTypeLessons: configLessonTypeLessons,
        lessonType,
        lessonTypeLessons: get(moduleLessonMap, lessonType),
        timetableInteractabilityProps,
        moduleInteractabilityProps: {
          moduleCode,
          moduleIsTaInTimetable,
        },
      }),
  );
}

/**
 * Hydrate timetable lessons with interactability info\
 * See type defintion of {@link InteractableLesson} for properties added
 */
export function getInteractableLessons(
  semTimetableConfigLessons: SemTimetableConfigWithLessons<Lesson>,
  modules: ModulesMap,
  semester: Semester,
  colors: ColorMapping,
  readOnly: boolean,
  isTaInTimetable: (moduleCode: ModuleCode) => boolean,
  activeLesson: Lesson | null,
): SemTimetableConfigWithLessons<InteractableLesson> {
  const activeLessonId: LessonId | null = activeLesson
    ? serializeLessonDetails(activeLesson)
    : null;

  return mapValues(
    semTimetableConfigLessons,
    (configModuleLessonMap: ModuleLessonMap<Lesson>, moduleCode: ModuleCode) =>
      getModuleInteractableLessons({
        configModuleLessonMap: configModuleLessonMap,
        moduleCode,
        moduleLessonMap: getModuleLessonMap(get(modules, moduleCode), semester),
        timetableInteractabilityProps: {
          modules,
          semester,
          colors,
          readOnly,
          activeLesson,
          activeLessonId,
        },
        isTaInTimetable,
      }),
  );
}
