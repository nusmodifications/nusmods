import { each, get } from 'lodash-es';
import {
  deserializeLessonDetails,
  getRecoverySerializedLessonDetails,
  isClassNo,
  makeModuleLessonMap,
  parseWeeks,
  serializeLessonDetails,
  serializeWeekNumbers,
  serializeWeekRange,
} from './lessonId';
import { ModuleLessonMap, RawLesson, WeekRange } from 'types/modules';
import { CS1010S, GES1021 } from '__mocks__/modules';
import { getModuleLessonMap, getModuleTimetable } from 'utils/modules';

const semester = 1;
const sampleModuleTimetable = getModuleTimetable(CS1010S, semester);

describe('serialize/parse weeks', () => {
  test('serialized weekRange should be deserialized to the same weekRange', () => {
    const weekRanges: WeekRange[] = [
      {
        start: '2026-01-13',
        end: '2026-02-14',
        weekInterval: 1,
      },
      {
        start: '2026-01-13',
        end: '2026-02-14',
        weeks: [2, 3, 5, 7, 11, 13],
      },
      {
        start: '2026-01-13',
        end: '2026-02-14',
        weekInterval: 1,
        weeks: [2, 3, 5, 7, 11, 13],
      },
    ];

    each(weekRanges, (weekRange) => {
      const deserializedWeekRange = parseWeeks(serializeWeekRange(weekRange));
      expect(deserializedWeekRange).toStrictEqual(weekRange);
    });
  });

  test('serialized week numbers should be deserialized to the same weekRange', () => {
    const weekNumbers = [2, 3, 5, 7, 11, 13];

    const deserializedWeekRange = parseWeeks(serializeWeekNumbers(weekNumbers));
    expect(deserializedWeekRange).toStrictEqual(weekNumbers);
  });
});

describe('makeModuleLessonMap', () => {
  test('should make lesson map from array of lessons', () => {
    const lectureLessons = [sampleModuleTimetable[0]];
    const recitationLessons = [sampleModuleTimetable[1], sampleModuleTimetable[2]];
    const tutorialLessons = [sampleModuleTimetable[11], sampleModuleTimetable[12]];

    const lessons: RawLesson[] = [...lectureLessons, ...recitationLessons, ...tutorialLessons];

    const expectedLessonMap: ModuleLessonMap<RawLesson> = {
      Lecture: {
        '1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13': sampleModuleTimetable[0],
      },
      Recitation: {
        '1|THU|1200|1300|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13': sampleModuleTimetable[1],
        '10|THU|1200|1300|RMI-SR1|1_2_3_4_5_6_7_8_9_10_11_12_13': sampleModuleTimetable[2],
      },
      Tutorial: {
        '1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13': sampleModuleTimetable[11],
        '10|TUE|0900|1000|COM1-0209|3_4_5_6_7_8_9_10_11_12_13': sampleModuleTimetable[12],
      },
    };

    expect(makeModuleLessonMap(lessons)).toStrictEqual(expectedLessonMap);
  });
});

describe('isClassNo', () => {
  test('should return true for classNo', () => {
    expect(isClassNo(['1'])).toBe(true);
    expect(isClassNo(['67'])).toBe(true);
  });

  test('should return false for serialized lessonIds', () => {
    expect(isClassNo([])).toBe(false);
    expect(isClassNo(['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'])).toBe(false);
    expect(
      isClassNo([
        '1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
        '1|MON|1830|2030|VCRm|2026-06-18_2026-05-21_2_1_3_5_7_9_11_13',
      ]),
    ).toBe(false);
  });
});

describe('deserializeLessonDetails', () => {
  const lesson = {
    classNo: '1',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    day: 'Monday',
    startTime: '1830',
    endTime: '2030',
    venue: 'VCRm',
  };

  describe('deserialized lessonId should be identical to lesson details that was serialized', () => {
    test('lesson with NumericWeeks', () => {
      const serializedLessonDetails = serializeLessonDetails(lesson);

      expect(serializedLessonDetails).toBe('1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13');
      expect(deserializeLessonDetails(serializedLessonDetails)).toStrictEqual(lesson);
    });

    test('lesson with WeekRange with both weekInterval and weeks', () => {
      const lessonWithWeekRange = {
        ...lesson,
        weeks: {
          start: '2026-06-18',
          end: '2026-05-21',
          weekInterval: 2,
          weeks: [1, 3, 5, 7, 9, 11, 13],
        },
      };
      const serializedLessonDetails = serializeLessonDetails(lessonWithWeekRange);

      expect(serializedLessonDetails).toBe(
        '1|MON|1830|2030|VCRm|2026-06-18_2026-05-21_2_1_3_5_7_9_11_13',
      );
      expect(deserializeLessonDetails(serializedLessonDetails)).toStrictEqual(lessonWithWeekRange);
    });

    test('lesson with WeekRange with neither weekInterval nor weeks', () => {
      const lessonWithWeekRange = {
        ...lesson,
        weeks: {
          start: '2026-06-18',
          end: '2026-05-21',
        },
      };
      const serializedLessonDetails = serializeLessonDetails(lessonWithWeekRange);

      expect(serializedLessonDetails).toBe('1|MON|1830|2030|VCRm|2026-06-18_2026-05-21_0');
      expect(deserializeLessonDetails(serializedLessonDetails)).toStrictEqual(lessonWithWeekRange);
    });

    test('lesson with WeekRange with no week interval', () => {
      const lessonWithWeekRange = {
        ...lesson,
        weeks: {
          start: '2026-06-18',
          end: '2026-05-21',
          weeks: [1, 3, 5, 7, 9, 11, 13],
        },
      };
      const serializedLessonDetails = serializeLessonDetails(lessonWithWeekRange);

      expect(serializedLessonDetails).toBe(
        '1|MON|1830|2030|VCRm|2026-06-18_2026-05-21_0_1_3_5_7_9_11_13',
      );
      expect(deserializeLessonDetails(serializedLessonDetails)).toStrictEqual(lessonWithWeekRange);
    });

    test('lesson with WeekRange with empty week numbers list', () => {
      const lessonWithWeekRange = {
        ...lesson,
        weeks: {
          start: '2026-06-18',
          end: '2026-05-21',
          weeks: [],
        },
      };
      const serializedLessonDetails = serializeLessonDetails(lessonWithWeekRange);

      expect(serializedLessonDetails).toBe('1|MON|1830|2030|VCRm|2026-06-18_2026-05-21_0__');
      expect(deserializeLessonDetails(serializedLessonDetails)).toStrictEqual(lessonWithWeekRange);
    });

    test('lesson with WeekRange with no week numbers list defined', () => {
      const lessonWithWeekRange = {
        ...lesson,
        weeks: {
          start: '2026-06-18',
          end: '2026-05-21',
          weekInterval: 10,
        },
      };
      const serializedLessonDetails = serializeLessonDetails(lessonWithWeekRange);

      expect(serializedLessonDetails).toBe('1|MON|1830|2030|VCRm|2026-06-18_2026-05-21_10');
      expect(deserializeLessonDetails(serializedLessonDetails)).toStrictEqual(lessonWithWeekRange);
    });
  });

  describe('reject malformed strings', () => {
    test('reject malformed lesson id', () => {
      const malformedLessonIds = [
        '1|ABC|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13',
        '1|MON|TEXT|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13',
        '1|MON|1830|TEXT|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13',
        '1|MON|1830|2030|VCRm|',
        '1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13|EXTRA',
      ];

      each(malformedLessonIds, (lessonId) => {
        expect(() => deserializeLessonDetails(lessonId)).toThrow('Lesson ID is malformed');
      });
    });

    test('reject malformed serialized weeks', () => {
      const lessonIdsWithMalformedSerializedWeeks = [
        '1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13_',
        '1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12__13',
        '1|MON|1830|2030|VCRm|-_2026-06-18_2026-05-21_2_1_3_5_7_9_11_13',
        '1|MON|1830|2030|VCRm|2026-06-18_2026-05-21__1_3_5_7_9_11_13',
        '1|MON|1830|2030|VCRm|2026-06-18_2026-05-21_2_1_3_5_7_9_11_13_-',
        '1|MON|1830|2030|VCRm|2026-06-18__2_1_3_5_7_9_11_13',
        '1|MON|1830|2030|VCRm|2026-06-18_2_1_3_5_7_9_11_13',
      ];

      each(lessonIdsWithMalformedSerializedWeeks, (lessonId) => {
        expect(() => deserializeLessonDetails(lessonId)).toThrow('Serialized weeks is malformed');
      });
    });
  });
});

describe('getRecoverySerializedLessonDetails', () => {
  test('return corresponding lesson ids if config contains valid class no', () => {
    const lessonMap = getModuleLessonMap(GES1021, 1);

    expect(getRecoverySerializedLessonDetails(get(lessonMap, 'Lecture'), ['SL1'])).toStrictEqual([
      'SL1|MON|1600|1800|LT27|1_2_3_4_5_6_7_8_9_10_11_12_13',
      'SL1|WED|1600|1800|LT27|1_2_3_4_5_6_7_8_9_10_11_12_13',
    ]);
  });

  const lessonMap = getModuleLessonMap(CS1010S, 1);

  test('return first lessonId if config is empty', () => {
    expect(getRecoverySerializedLessonDetails(get(lessonMap, 'Tutorial'), [])).toStrictEqual([
      '1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13',
    ]);
  });

  test('return valid lessonIds if any are present', () => {
    expect(
      getRecoverySerializedLessonDetails(get(lessonMap, 'Tutorial'), [
        '2|MON|1000|1100|COM1-0217|3_4_5_6_7_8_9_10_11_12_13',
        '3|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
      ]),
    ).toStrictEqual(['2|MON|1000|1100|COM1-0217|3_4_5_6_7_8_9_10_11_12_13']);
  });

  test('return first lessonId if no classNo or lessonId is valid', () => {
    expect(
      getRecoverySerializedLessonDetails(get(lessonMap, 'Tutorial'), [
        '3|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
      ]),
    ).toStrictEqual(['1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13']);
  });
});
