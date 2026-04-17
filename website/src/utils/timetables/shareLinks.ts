import {
  castArray,
  filter,
  get,
  groupBy,
  invert,
  isArray,
  isEmpty,
  keys,
  last,
  map,
  mapValues,
  reduce,
} from 'lodash-es';
import qs from 'query-string';

import { LessonType, RawLessonWithIndex, ModuleCode } from 'types/modules';

import { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';

import { getLessonIndices, LESSON_TYPE_ABBREV, makeLessonIndicesMap } from 'utils/timetables';

// Reverse lookup map of LESSON_TYPE_ABBREV
export const LESSON_ABBREV_TYPE: { [key: string]: LessonType } = invert(LESSON_TYPE_ABBREV);

// Used for module config serialization - these must be query string safe
// See: https://stackoverflow.com/a/31300627
export const LESSON_TYPE_SEP = ';';
export const LESSON_TYPE_KEY_VALUE_SEP = ':';
export const LESSON_SEP = ',';

export const MODULE_SEP = ',';

/**
 * Serializes a module's lesson config for sharing\
 * Given input `{ Lecture: [0], Tutorial: [1] }`\
 * Will output `LEC:(0),TUT:(1)`
 */
function serializeModuleConfig(config: ModuleLessonConfig): string {
  return map(
    config,
    (lessonIndex, lessonType) =>
      `${LESSON_TYPE_ABBREV[lessonType]}${LESSON_TYPE_KEY_VALUE_SEP}(${lessonIndex.join(
        LESSON_SEP,
      )})`,
  ).join(';');
}

/**
 * Converts a timetable config to query string\
 * Given input
 * ```
 * {
 *   CS2104: { Lecture: [0], Tutorial: [1] },
 *   CS2107: { Lecture: [0], Tutorial: [1] },
 * }
 * ```
 * Will output `CS2104=LEC:(0),TUT:(1)&CS2107=LEC:(0),TUT:(1)`
 */
export function serializeTimetable(timetable: SemTimetableConfig): string {
  // We are using query string safe characters, so this encoding is unnecessary
  return qs.stringify(mapValues(timetable, serializeModuleConfig), { encode: false });
}

/**
 * Serializes TA modules for sharing\
 * Given input `["CS1010S", "CS3216"]`\
 * Will output `&ta=CS1010S,CS3216`
 */
export function serializeModuleList(modules: ModuleCode[]): string {
  return isEmpty(modules) ? '' : modules.join(MODULE_SEP);
}

/**
 * Parses a serialized v1 format TA config for module codes\
 * Does not error if the TA module config includes a module code not inside the non-TA module config\
 * @param taSerialized e.g. `CS2100(TUT:2,TUT:3,LAB:1),CS2107(TUT:8)`
 * @returns TA module codes if the module lesson config is v1 format serialized (e.g. `["CS2100","CS2107"]`)\
 * Otherwise, returns an empty array
 */
export function parseTaModuleCodes(taSerialized?: string | null): ModuleCode[] {
  if (!taSerialized || taSerialized[0] === '(') return [];
  // CS2100(TUT:2,TUT:3,LAB:1),CS2107(TUT:8)
  const serializedTaModuleLessonConfigs = taSerialized.split(/(?<=\)),/);
  // CS2100(TUT:2,TUT:3,LAB:1)
  // CS2107(TUT:8)
  return reduce(
    serializedTaModuleLessonConfigs,
    (accumulatedTaModuleCodes, serializedTaModuleLessonConfig) => {
      const moduleCode = serializedTaModuleLessonConfig.match(/(.*)(?=\()/);
      if (!moduleCode || moduleCode.length !== 2) {
        return accumulatedTaModuleCodes;
      }
      return [...accumulatedTaModuleCodes, moduleCode[0]];
    },
    [] as ModuleCode[],
  );
}

/**
 * Deserializes a serialized v1 format TA config to a module lesson config
 * @param taSerialized e.g. `CS2100(TUT:2,TUT:3,LAB:1),CS2107(TUT:8)`
 * @param getModuleSemesterTimetable getter to obtain the lesson indices of the module's lessons
 * @returns migrated semester timetable config
 */
function deserializeTaModulesConfigV1(
  taSerialized: string | null | undefined,
  getModuleSemesterTimetable: (moduleCode: ModuleCode) => readonly RawLessonWithIndex[],
): SemTimetableConfig {
  if (!taSerialized || last(taSerialized) !== ')') {
    return {};
  }

  // CS2100(TUT:2,TUT:3,LAB:1),CS2107(TUT:8)
  const serializedTaModuleLessonConfigs = taSerialized.split(/(?<=\)),/);
  // ["CS2100(TUT:2,TUT:3,LAB:1)", "CS2107(TUT:8)"]
  return reduce(
    serializedTaModuleLessonConfigs,
    (accumulatedTaTimetableConfig, serializedTaModuleLessonConfig) => {
      // CS2100(TUT:2,TUT:3,LAB:1)
      const moduleConfig = serializedTaModuleLessonConfig.match(/(.*)\((.*)\)/);
      if (!moduleConfig || moduleConfig.length !== 3) {
        return accumulatedTaTimetableConfig;
      }
      const [, moduleCode, lessons] = moduleConfig;
      // ["CS2100", "TUT:2,TUT:3,LAB:1"]
      const timetable = getModuleSemesterTimetable(moduleCode);
      if (!timetable) return accumulatedTaTimetableConfig;
      const lessonIndicesMap = makeLessonIndicesMap(timetable);

      const moduleLessonConfig = lessons
        .split(LESSON_SEP)
        .reduce((accumulatedModuleLessonConfig, lesson) => {
          // TUT:2
          const [lessonTypeAbbr, classNo] = lesson.split(LESSON_TYPE_KEY_VALUE_SEP);
          // ["TUT", "2"]
          const lessonType = LESSON_ABBREV_TYPE[lessonTypeAbbr];
          if (!lessonType) return accumulatedModuleLessonConfig;
          const lessonIndices = getLessonIndices(lessonIndicesMap, lessonType, classNo);
          return {
            ...accumulatedModuleLessonConfig,
            [lessonType]: [
              ...(accumulatedModuleLessonConfig[lessonType] ?? []),
              ...(lessonIndices ?? []),
            ],
          } as ModuleLessonConfig;
        }, {} as ModuleLessonConfig);

      return {
        ...accumulatedTaTimetableConfig,
        [moduleCode]: moduleLessonConfig,
      } as SemTimetableConfig;
    },
    {} as SemTimetableConfig,
  );
}

/**
 * Deserializes a serialized v2 format lesson config string to a module lesson config

 * @param moduleLessonConfig moduleLessonConfig from previously parsed params to combine with, if any
 * @param serializedModuleLessonConfig e.g. `LEC:(0,1);TUT:(3)`
 * @param timetable Array of valid lessons
 * @returns Combined moduleLessonConfig
 */
function deserializeModuleLessonConfig(
  moduleLessonConfig: ModuleLessonConfig,
  serializedModuleLessonConfig: string,
  timetable: readonly RawLessonWithIndex[],
): ModuleLessonConfig {
  const lessonsByLessonType = groupBy(timetable, 'lessonType');
  // LEC:(0,1);TUT:(3)
  return reduce(
    serializedModuleLessonConfig.split(LESSON_TYPE_SEP),
    (accumulatedModuleLessonConfig, lessonTypeSerialized) => {
      // LEC:(0,1)
      const [lessonTypeAbbr, lessonIndicesSerialized] =
        lessonTypeSerialized.split(LESSON_TYPE_KEY_VALUE_SEP);
      // ["LEC", "0,1"]
      const unwrappedLessonIndicesSerialized = lessonIndicesSerialized.match(/(?<=\()(.*)(?=\))/);
      if (!unwrappedLessonIndicesSerialized) {
        return accumulatedModuleLessonConfig;
      }
      const lessonIndices = map(
        unwrappedLessonIndicesSerialized[0].split(LESSON_SEP),
        (lessonIndex) => parseInt(lessonIndex, 10),
      ); // [0, 1]
      const lessonType = LESSON_ABBREV_TYPE[lessonTypeAbbr];
      const validLessonIndices = map(lessonsByLessonType[lessonType], 'lessonIndex');
      const validatedLessonIndices = filter(lessonIndices, (lessonIndex) =>
        validLessonIndices.includes(lessonIndex),
      );
      return {
        ...accumulatedModuleLessonConfig,
        [lessonType]: [
          ...(accumulatedModuleLessonConfig[lessonType] ?? []),
          ...validatedLessonIndices,
        ],
      };
    },
    moduleLessonConfig,
  );
}

/**
 * Deserializes a serialized v1 format lesson config to a module lesson config
 * @param moduleLessonConfig from previously parsed params, if any
 * @param serializedModuleLessonConfig e.g. `LEC:1,TUT:1,REC:1`
 * @param timetable Array of valid lessons
 * @returns Combined moduleLessonConfig
 */
function deserializeModuleLessonConfigV1(
  moduleLessonConfig: ModuleLessonConfig,
  serializedModuleLessonConfig: string,
  timetable: readonly RawLessonWithIndex[],
): ModuleLessonConfig {
  // LEC:1,TUT:1,REC:1
  const lessonIndicesMap = makeLessonIndicesMap(timetable);
  return reduce(
    serializedModuleLessonConfig.split(LESSON_SEP),
    (accumulatedModuleLessonConfig, lessonTypeSerialized) => {
      // LEC:1
      const [lessonTypeAbbr, classNo] = lessonTypeSerialized.split(LESSON_TYPE_KEY_VALUE_SEP);
      // ["LEC", "1"]
      const lessonType = LESSON_ABBREV_TYPE[lessonTypeAbbr];
      const lessonIndices = getLessonIndices(lessonIndicesMap, lessonType, classNo);
      return {
        ...accumulatedModuleLessonConfig,
        [lessonType]: [
          ...(accumulatedModuleLessonConfig[lessonType] ?? []),
          ...(lessonIndices ?? []),
        ],
      };
    },
    moduleLessonConfig,
  );
}

/**
 * Deserializes hidden modules and TA modules config
 * @param serialized e.g. `CS3216,CS1010`
 * @returns `["CS3216", "CS1010"]`
 */
function deserializeModuleCodes(serialized: string): ModuleCode[] {
  return serialized.split(LESSON_SEP);
}

function deserializeHiddenOrTaConfig(paramsKey: string, paramsValue: string | string[]) {
  const moduleCodes = reduce(
    castArray(paramsValue),
    (accumulatedModules, paramValue) => {
      // Skip if the ta param is a serialized with the v1 format
      if (paramsKey === 'ta' && last(paramValue) === ')') return accumulatedModules;

      return [...accumulatedModules, ...deserializeModuleCodes(paramValue)];
    },
    [] as ModuleCode[],
  );
  return moduleCodes;
}

interface DeserializationResult {
  semTimetableConfig: SemTimetableConfig;
  ta: ModuleCode[];
  hidden: ModuleCode[];
}

/**
 * Parses hidden and TA module list
 * @param accumulatedDeserializationResult
 * @param paramsKey currently only 2 params are used as keys for serialized lists of modules: hidden, and ta
 * @param paramsValue
 * @returns
 */
function parseModuleListParams(
  accumulatedDeserializationResult: DeserializationResult,
  paramsKey: 'hidden' | 'ta',
  paramsValue: string | string[] | null,
): DeserializationResult {
  if (!paramsValue) {
    return accumulatedDeserializationResult;
  }
  const moduleCodes = deserializeHiddenOrTaConfig(paramsKey, paramsValue);
  return {
    ...accumulatedDeserializationResult,
    [paramsKey]: [...accumulatedDeserializationResult[paramsKey], ...moduleCodes],
  };
}

/**
 * Helper function for {@link deserializeTimetable|deserializeTimetable}
 * It parses the serialization string of each module.
 */
function parseLessonConfigParams(
  accumulatedDeserializationResult: DeserializationResult,
  paramsKey: string,
  paramsValue: string | string[] | null,
  getModuleSemesterTimetable: (moduleCode: ModuleCode) => readonly RawLessonWithIndex[],
  getTaModuleLessonConfig: (moduleCode: ModuleCode) => ModuleLessonConfig,
): DeserializationResult {
  const moduleCode = paramsKey;
  if (!paramsValue) {
    return {
      ...accumulatedDeserializationResult,
      semTimetableConfig: {
        ...accumulatedDeserializationResult.semTimetableConfig,
        [moduleCode]: {},
      },
    };
  }
  const timetable = getModuleSemesterTimetable(moduleCode);
  const moduleLessonConfig = reduce(
    castArray(paramsValue),
    (accumulatedModuleLessonConfig, serializedModuleLessonConfig) => {
      // If using the lesson group serialization (v2)
      // paramsKey = CS2103T
      // paramsValue = LEC:(0,1);TUT:(3)
      if (
        serializedModuleLessonConfig &&
        serializedModuleLessonConfig[serializedModuleLessonConfig.length - 1] === ')'
      )
        return deserializeModuleLessonConfig(
          accumulatedModuleLessonConfig,
          serializedModuleLessonConfig,
          timetable,
        );

      // TA module lesson config overrides the non-TA module lesson config
      const taModuleLessonConfig = getTaModuleLessonConfig(moduleCode);
      if (taModuleLessonConfig) return taModuleLessonConfig;

      // If using the v1 format serialization
      // paramsKey = CS2103T
      // paramsValue = LEC:0,TUT:3
      return deserializeModuleLessonConfigV1(
        accumulatedModuleLessonConfig,
        serializedModuleLessonConfig,
        timetable,
      );
    },
    {} as ModuleLessonConfig,
  );
  return {
    ...accumulatedDeserializationResult,
    semTimetableConfig: {
      ...accumulatedDeserializationResult.semTimetableConfig,
      [moduleCode]: moduleLessonConfig,
    },
  };
}

/**
 * Entry point to deserialize a serialized timetable string\
 * Checks serialization format and parses accordingly
 * - V1 format: `?CS1010S=LEC:1,TUT:1,REC:1&ta=CS1010S(LEC:1,TUT:1,TUT:2,REC:1)&hidden=CS1010S`
 * - V2 format: `?CS1010S=LEC:(0);TUT:(11,22);REC:(1)&ta=CS1010S&hidden=CS1010S`
 * @param serialized
 * @param getModuleSemesterTimetable
 * @returns
 */
export function deserializeTimetable(
  serialized: string,
  getModuleSemesterTimetable: (moduleCode: ModuleCode) => readonly RawLessonWithIndex[],
): {
  semTimetableConfig: SemTimetableConfig;
  ta: ModuleCode[];
  hidden: ModuleCode[];
} {
  const params = qs.parse(serialized);
  const taParams = isArray(params.ta) ? last(params.ta) : params.ta;
  // If TA modules were serialized using the v1 format
  // we deserialize it first so we can skip deserializing the module code down the line
  // because TA module lesson config overrides the non-TA module lesson config
  const taModuleLessonConfigs = deserializeTaModulesConfigV1(taParams, getModuleSemesterTimetable);
  const getTaModuleLessonConfig = (moduleCode: ModuleCode): ModuleLessonConfig =>
    get(taModuleLessonConfigs, moduleCode);

  return reduce(
    params,
    (accumulatedDeserializationResult, paramsValue, paramsKey) => {
      switch (paramsKey) {
        case 'hidden':
        case 'ta': {
          return parseModuleListParams(accumulatedDeserializationResult, paramsKey, paramsValue);
        }

        default: {
          return parseLessonConfigParams(
            accumulatedDeserializationResult,
            paramsKey,
            paramsValue,
            getModuleSemesterTimetable,
            getTaModuleLessonConfig,
          );
        }
      }
    },
    {
      semTimetableConfig: {},
      ta: keys(taModuleLessonConfigs),
      hidden: [],
    } as DeserializationResult,
  );
}
