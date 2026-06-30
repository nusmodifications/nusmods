import {
  castArray,
  filter,
  get,
  includes,
  invert,
  isArray,
  isEmpty,
  isEqual,
  keys,
  last,
  map,
  mapValues,
  nth,
  omit,
  pickBy,
  reduce,
  some,
  toPairs,
  uniq,
} from 'lodash-es';
import qs, { ParsedQuery } from 'query-string';

import {
  ClassNo,
  LessonId,
  LessonIndex,
  LessonType,
  Module,
  ModuleCode,
  ModuleLessonMap,
  RawLesson,
  Semester,
} from 'types/modules';
import { ModulesMap } from 'types/reducers';

import { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import { getModuleLessonMap, getModuleTimetable } from 'utils/modules';

import { LESSON_TYPE_ABBREV } from 'utils/timetables';
import { serializeLessonDetails } from './lessonId';

// Reverse lookup map of LESSON_TYPE_ABBREV
export const LESSON_ABBREV_TYPE: { [key: string]: LessonType } = invert(LESSON_TYPE_ABBREV);

// Used for module config serialization - these must be query string safe
// See: https://stackoverflow.com/a/31300627
export const V1_LESSON_TYPE_SEP = ',';
export const V2_LESSON_TYPE_SEP = ';';
export const LESSON_TYPE_KEY_VALUE_SEP = ':';
export const LESSON_SEP = ',';

export const MODULE_SEP = ',';

/**
 * Serializes a module's lesson config for sharing\
 * Given input `{ Lecture: ['1'], Tutorial: ['1'] }`\
 * Will output `LEC:1,TUT:1`
 */
function serializeModuleConfig(config: ModuleLessonConfig, isTa: boolean): string {
  return map(config, (lessonIds, lessonType) => {
    const joinedLessonIds = lessonIds.join(LESSON_SEP);
    const serializedLessonIds = isTa ? `(${joinedLessonIds})` : joinedLessonIds;
    return `${LESSON_TYPE_ABBREV[lessonType]}${LESSON_TYPE_KEY_VALUE_SEP}${serializedLessonIds}`;
  }).join(isTa ? V2_LESSON_TYPE_SEP : V1_LESSON_TYPE_SEP);
}

/**
 * Converts a timetable config to query string\
 * Given input
 * ```
 * {
 *   CS2104: { Lecture: ['1'], Tutorial: ['1'] },
 *   CS2107: { Lecture: ['1'], Tutorial: ['1'] },
 * }
 * ```
 * Will output `CS2104=LEC:1,TUT:1&CS2107=LEC:1,TUT:1`
 */
export function serializeTimetable({
  semTimetableConfig,
  hidden,
  ta,
}: {
  semTimetableConfig: SemTimetableConfig;
  hidden: ModuleCode[];
  ta: ModuleCode[];
}): string {
  // We are using query string safe characters, so this encoding is unnecessary
  return qs.stringify(
    {
      ...mapValues(semTimetableConfig, (moduleLessonConfig, moduleCode) =>
        serializeModuleConfig(moduleLessonConfig, includes(ta, moduleCode)),
      ),
      hidden: serializeModuleList(hidden),
      ta: serializeModuleList(ta),
    },
    { encode: false },
  );
}

/**
 * Serializes TA modules for sharing\
 * Given input `["CS1010S", "CS3216"]`\
 * Will output `&ta=CS1010S,CS3216`
 */
export function serializeModuleList(modules: ModuleCode[]): string | undefined {
  if (isEmpty(modules)) return undefined;
  return modules.join(MODULE_SEP);
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
 * @param getModuleSemesterTimetable getter to obtain the `LessonId`s of the module's lessons
 * @returns migrated semester timetable config
 */
function deserializeTaModulesConfigV1(
  taSerialized: string | null | undefined,
  modules: ModulesMap,
  semester: number,
): SemTimetableConfig {
  if (!taSerialized || last(taSerialized) !== ')') {
    return {};
  }

  // CS2100(TUT:2,TUT:3,LAB:1),CS2107(TUT:8)
  const serializedTaModuleLessonConfigs = taSerialized.split(/(?<=\)),/);
  // ["CS2100(TUT:2,TUT:3,LAB:1)", "CS2107(TUT:8)"]
  const taModuleLessonConfigs: SemTimetableConfig = reduce(
    serializedTaModuleLessonConfigs,
    (accumulatedTaTimetableConfig: SemTimetableConfig, serializedTaModuleLessonConfig: string) => {
      // CS2100(TUT:2,TUT:3,LAB:1)
      const moduleConfig: RegExpMatchArray | null =
        serializedTaModuleLessonConfig.match(/(.*)\((.*)\)/);
      if (!moduleConfig || moduleConfig.length !== 3) {
        return accumulatedTaTimetableConfig;
      }
      const [, moduleCode, lessons] = moduleConfig;
      // ["CS2100", "TUT:2,TUT:3,LAB:1"]
      const module: Module = get(modules, moduleCode);
      if (!module) return accumulatedTaTimetableConfig;

      const lessonMap: Readonly<ModuleLessonMap<RawLesson>> = getModuleLessonMap(module, semester);

      const moduleLessonConfig: ModuleLessonConfig = lessons
        .split(LESSON_SEP)
        .reduce((accumulatedModuleLessonConfig, lesson) => {
          // TUT:2
          const [lessonTypeAbbr, classNo] = lesson.split(LESSON_TYPE_KEY_VALUE_SEP);
          // ["TUT", "2"]
          const lessonType = LESSON_ABBREV_TYPE[lessonTypeAbbr];
          if (!lessonType) return accumulatedModuleLessonConfig;

          const lessonsWithLessonType = get(lessonMap, lessonType);
          if (!lessonsWithLessonType) return accumulatedModuleLessonConfig;

          const lessonsWithClassNo = filter(
            toPairs(lessonsWithLessonType),
            ([, lessonWithClassNo]) => lessonWithClassNo.classNo === classNo,
          );
          const classNoLessonIds = map(lessonsWithClassNo, ([lessonId]) => lessonId);

          return {
            ...accumulatedModuleLessonConfig,
            [lessonType]: [
              ...(accumulatedModuleLessonConfig[lessonType] ?? []),
              ...classNoLessonIds,
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

  return taModuleLessonConfigs;
}

export function deserializeTaModulesConfigV2AndV3(taSerialized: string) {
  return taSerialized.split(/(?<=\)),/);
}

/**
 * Unwraps V2 and V3 serialization of a lesson type, into its lesson type and lesson identifiers
 */
function unwrapSerializedLessonTypeConfig(lessonTypeSerialized: string): {
  lessonType: LessonType;
  serializedLessons: string;
} | null {
  // LAB:(1)
  const [lessonTypeAbbr, serializedLessonTypeConfig] =
    lessonTypeSerialized.split(LESSON_TYPE_KEY_VALUE_SEP);
  const lessonType: LessonType = get(LESSON_ABBREV_TYPE, lessonTypeAbbr);
  if (!lessonType) return null;

  const unwrappedLessonType: RegExpMatchArray | null =
    serializedLessonTypeConfig.match(/(?<=\()(.*)(?=\))/);
  if (!unwrappedLessonType) return null;

  return {
    lessonType,
    serializedLessons: unwrappedLessonType[0],
  };
}

/**
 * Deserializes lesson identifiers from V2 and V3 serialization, converting V2 lesson indices to V3 `LessonId`s
 * @param timetable used to get lesson from lesson index
 * @param lessonType used to that the lesson at that lesson index belongs to the `LessonType`
 * @param lessonsWithLessonType used to obtain
 * @returns
 */
function deserializeLessonIdentifiers(
  serializedLessonIdentifiers: string,
  timetable: readonly RawLesson[],
  lessonType: LessonType,
): LessonId[] {
  return reduce(
    serializedLessonIdentifiers.split(LESSON_SEP),
    (accumulatedDeserializedLessons, lessonIdentifier) => {
      const isLessonIndex: boolean = /^\d+$/.test(lessonIdentifier); // parseInt coerces "1|..." to 1

      if (isLessonIndex) {
        const lessonIndex: LessonIndex = parseInt(lessonIdentifier, 10);
        const lesson: RawLesson | undefined = nth(timetable, lessonIndex);

        if (!lesson || lesson.lessonType !== lessonType) return accumulatedDeserializedLessons;

        return [...accumulatedDeserializedLessons, serializeLessonDetails(lesson)];
      }

      return [...accumulatedDeserializedLessons, lessonIdentifier];
    },
    [] as LessonId[],
  );
}

/**
 * Deserializes a serialized v2 or v3 format lesson config string to a module lesson config
 * @param moduleLessonConfig moduleLessonConfig from previously parsed params to combine with, if any
 * @param serializedModuleLessonConfig
 * v2: `CS4243=LAB:(1);LEC:(5)`\
 * v3: `CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:(1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)`
 * @param timetable Array of valid lessons
 * @returns Combined moduleLessonConfig
 */
export function deserializeModuleLessonConfigV2AndV3(
  moduleLessonConfig: ModuleLessonConfig,
  serializedModuleLessonConfig: string,
  lessonMap: Readonly<ModuleLessonMap<RawLesson>>,
  timetable: readonly RawLesson[],
  isTa: boolean,
): ModuleLessonConfig {
  // V2: LAB:(1);LEC:(5)
  // V3: LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:(1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)
  return reduce(
    serializedModuleLessonConfig.split(V2_LESSON_TYPE_SEP),
    (accumulatedModuleLessonConfig, lessonTypeSerialized) => {
      // LAB:(1)
      const unwrappedLessonType = unwrapSerializedLessonTypeConfig(lessonTypeSerialized);
      if (!unwrappedLessonType) return accumulatedModuleLessonConfig;

      const lessonType: LessonType = unwrappedLessonType.lessonType;
      const lessonsWithLessonType: Record<LessonId, RawLesson> = get(lessonMap, lessonType);
      if (!lessonsWithLessonType) return accumulatedModuleLessonConfig;

      const lessonIds: LessonId[] = deserializeLessonIdentifiers(
        unwrappedLessonType.serializedLessons,
        timetable,
        lessonType,
      );

      if (isTa) {
        const validLessonIds = new Set(keys(lessonsWithLessonType));
        const validatedLessonIds = filter(lessonIds, (lessonId) => validLessonIds.has(lessonId));

        return {
          ...accumulatedModuleLessonConfig,
          [lessonType]: [
            ...(get(accumulatedModuleLessonConfig, lessonType, []) as LessonId[]),
            ...validatedLessonIds,
          ],
        };
      }

      if (!isEmpty(lessonIds)) {
        const firstClassNo: ClassNo | undefined = get(lessonsWithLessonType, lessonIds[0])?.classNo;

        if (firstClassNo) {
          const lessonsWithFirstClassNo = pickBy(
            lessonsWithLessonType,
            (lesson) => lesson.classNo === firstClassNo,
          );

          // The set of lessons deserialized must be identical to the lessons with that classNo
          // If any of the lessons is invalid, the module timetable must have changed, so we cannot reliably deserialize the share link
          if (isEqual(new Set(lessonIds), new Set(keys(lessonsWithFirstClassNo))))
            return {
              ...accumulatedModuleLessonConfig,
              [lessonType]: [firstClassNo],
            };
        }
      }

      // We do not attempt to recover an empty lesson config because it would be inventing data that is not in the shared link
      // Allow validation logic to recover the config instead
      return {
        ...accumulatedModuleLessonConfig,
        [lessonType]: [],
      };
    },
    moduleLessonConfig,
  );
}

/**
 * Deserializes a serialized v1 format lesson config to a module lesson config
 * @param moduleLessonConfig from previously parsed params, if any
 * @param serializedModuleLessonConfig e.g. `LEC:1,REC:2,TUT:3`
 * @param timetable Array of valid lessons
 * @returns Combined moduleLessonConfig
 */
export function deserializeModuleLessonConfigV1(
  moduleLessonConfig: ModuleLessonConfig,
  serializedModuleLessonConfig: string,
  lessonMap: Readonly<ModuleLessonMap<RawLesson>>,
  isTa: boolean,
): ModuleLessonConfig {
  // LEC:1,REC:2,TUT:3
  return reduce(
    serializedModuleLessonConfig.split(LESSON_SEP),
    (accumulatedModuleLessonConfig, lessonTypeSerialized) => {
      // LEC:1
      const [lessonTypeAbbr, classNo] = lessonTypeSerialized.split(LESSON_TYPE_KEY_VALUE_SEP);
      // ["LEC", "1"]
      const lessonType: LessonType = get(LESSON_ABBREV_TYPE, lessonTypeAbbr);
      if (!lessonType) return accumulatedModuleLessonConfig;

      const lessonsWithLessonType: Record<LessonId, RawLesson> = get(lessonMap, lessonType);
      if (!lessonsWithLessonType) return accumulatedModuleLessonConfig;
      const isClassNoValid: boolean = some(
        lessonsWithLessonType,
        (lesson) => lesson.classNo === classNo,
      );
      const accumulatedLessonTypeLessonConfig: [ClassNo] | LessonId[] = get(
        accumulatedModuleLessonConfig,
        lessonType,
        [] as string[],
      );
      if (!isClassNoValid)
        return {
          ...accumulatedModuleLessonConfig,
          [lessonType]: accumulatedLessonTypeLessonConfig,
        };

      if (!isTa) {
        return {
          ...accumulatedModuleLessonConfig,
          [lessonType]: [classNo],
        };
      }

      const lessonIds: LessonId[] = keys(
        pickBy(lessonsWithLessonType, (lesson) => lesson.classNo === classNo),
      );
      return {
        ...accumulatedModuleLessonConfig,
        [lessonType]: [...(accumulatedLessonTypeLessonConfig as LessonId[]), ...lessonIds],
      };
    },
    moduleLessonConfig,
  );
}

function deserializeHiddenOrTaConfig(paramsValue: string | string[] | null): ModuleCode[] {
  if (!paramsValue) return [];

  const serializedModuleList: string | undefined = isArray(paramsValue)
    ? last(paramsValue)
    : paramsValue;
  if (!serializedModuleList || last(serializedModuleList) === ')') return [];

  return serializedModuleList.split(LESSON_SEP);
}

function isV1Config(serializedModuleLessonConfig: string) {
  return last(serializedModuleLessonConfig) !== ')';
}

/**
 * Helper function for {@link deserializeTimetable|deserializeTimetable}
 * It parses the serialization string of each module.
 */
function parseLessonConfigParams(
  accumulatedSemTimetableConfig: SemTimetableConfig,
  moduleCode: string,
  serializedModuleLessonConfig: string | string[] | null,
  isTa: boolean,
  getTaModuleLessonConfig: (moduleCode: ModuleCode) => ModuleLessonConfig | undefined,
  modules: ModulesMap,
  semester: number,
): SemTimetableConfig {
  const module: Module | undefined = get(modules, moduleCode, undefined);
  if (!module) return accumulatedSemTimetableConfig;

  if (!serializedModuleLessonConfig) {
    return {
      ...accumulatedSemTimetableConfig,
      [moduleCode]: get(accumulatedSemTimetableConfig, moduleCode, {}),
    };
  }

  const lessonMap: Readonly<ModuleLessonMap<RawLesson>> = getModuleLessonMap(module, semester);
  const timetable: readonly RawLesson[] = getModuleTimetable(module, semester);
  const moduleLessonConfig = reduce(
    castArray(serializedModuleLessonConfig),
    (accumulatedModuleLessonConfig, serializedModuleLessonConfig) => {
      // If using the lesson group serialization (v2) or the lesson details serialization (v3)
      // paramsKey = CS4243
      // paramsValue = LAB:(1);LEC:(5)
      if (serializedModuleLessonConfig && !isV1Config(serializedModuleLessonConfig))
        return deserializeModuleLessonConfigV2AndV3(
          accumulatedModuleLessonConfig,
          serializedModuleLessonConfig,
          lessonMap,
          timetable,
          isTa,
        );

      // TA module lesson config overrides the non-TA module lesson config
      const taModuleLessonConfig: ModuleLessonConfig | undefined =
        getTaModuleLessonConfig(moduleCode);
      if (taModuleLessonConfig) return taModuleLessonConfig;

      // If using the v1 format serialization
      // paramsKey = CS4243
      // paramsValue = LAB:2,LEC:1
      return deserializeModuleLessonConfigV1(
        accumulatedModuleLessonConfig,
        serializedModuleLessonConfig,
        lessonMap,
        isTa,
      );
    },
    {} as ModuleLessonConfig,
  );

  return {
    ...accumulatedSemTimetableConfig,
    [moduleCode]: moduleLessonConfig,
  };
}

/**
 * Entry point to deserialize a serialized timetable string\
 * Checks serialization format and parses accordingly
 * - V1 format: `?CS4243=LEC:1,LAB:1&CS1010S=LEC:1,TUT:1,REC:1&ta=CS1010S(LEC:1,TUT:1,TUT:2,REC:1)&hidden=CS1010S`
 * - V2 format: `?CS4243=LEC:(5);LAB:(0)&CS1010S=LEC:(0);TUT:(11,22);REC:(1)&ta=CS1010S&hidden=CS1010S`
 * - V3 format: `?CS4243=LEC:1,LAB:1&CS1010S=LEC:(1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13);TUT:(1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13,2|MON|1000|1100|COM1-0217|3_4_5_6_7_8_9_10_11_12_13;REC:(1|THU|1200|1300|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13)&ta=CS1010S&hidden=CS1010S`
 * @param serialized
 * @param getModuleSemesterTimetable
 * @returns
 */
export function deserializeTimetable(
  serialized: string,
  modules: ModulesMap,
  semester: Semester,
): {
  semTimetableConfig: SemTimetableConfig;
  ta: ModuleCode[];
  hidden: ModuleCode[];
} {
  const params = qs.parse(serialized);
  const taParams: string | null | undefined = isArray(params.ta) ? last(params.ta) : params.ta;
  const taModuleLessonConfigs: SemTimetableConfig = deserializeTaModulesConfigV1(
    taParams,
    modules,
    semester,
  );

  const getTaModuleLessonConfig = (moduleCode: ModuleCode): ModuleLessonConfig | undefined =>
    get(taModuleLessonConfigs, moduleCode);

  const serializedSemTimetableConfig = omit(params, ['hidden', 'ta']);
  const taModuleCodes: ModuleCode[] = [
    ...keys(taModuleLessonConfigs),
    ...deserializeHiddenOrTaConfig(get(params, 'ta')),
  ];
  const taModuleCodesSet = new Set(taModuleCodes);

  const semTimetableConfig: SemTimetableConfig = reduce(
    serializedSemTimetableConfig,
    (accumulatedSemTimetableConfig, serializedModuleLessonConfig, moduleCode) =>
      parseLessonConfigParams(
        accumulatedSemTimetableConfig,
        moduleCode,
        serializedModuleLessonConfig,
        taModuleCodesSet.has(moduleCode),
        getTaModuleLessonConfig,
        modules,
        semester,
      ),
    {} as SemTimetableConfig,
  );

  const validModuleCodes: Set<ModuleCode> = new Set(keys(semTimetableConfig));
  return {
    semTimetableConfig,
    ta: filter(taModuleCodes, (moduleCode) => validModuleCodes.has(moduleCode)),
    hidden: filter(deserializeHiddenOrTaConfig(get(params, 'hidden')), (moduleCode) =>
      validModuleCodes.has(moduleCode),
    ),
  };
}

export function getImportedModuleCodes(parsedQuery: ParsedQuery): ModuleCode[] {
  const taSerialized: string | null | undefined = isArray(parsedQuery.ta)
    ? last(parsedQuery.ta)
    : parsedQuery.ta;
  const taModuleCodes: ModuleCode[] = parseTaModuleCodes(taSerialized);
  return uniq([...keys(omit(parsedQuery, ['ta', 'hidden'])), ...taModuleCodes]);
}
