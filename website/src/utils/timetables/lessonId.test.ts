import { each } from 'lodash-es';
import {
  deserializeLessonDetails,
  makeModuleLessonMap,
  parseWeeks,
  serializeLessonDetails,
  serializeWeekNumbers,
  serializeWeekRange,
} from './lessonId';
import { ModuleLessonMap, RawLesson, WeekRange } from 'types/modules';
import { CS1010S } from '__mocks__/modules';
import { getModuleTimetable } from 'utils/modules';

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
      expect(deserializedWeekRange).resolves.toStrictEqual(weekRange);
    });
  });

  test('serialized week numbers should be deserialized to the same weekRange', () => {
    const weekNumbers = [2, 3, 5, 7, 11, 13];

    const deserializedWeekRange = parseWeeks(serializeWeekNumbers(weekNumbers));
    expect(deserializedWeekRange).resolves.toStrictEqual(weekNumbers);
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
      expect(deserializeLessonDetails(serializedLessonDetails)).resolves.toStrictEqual(lesson);
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
      expect(deserializeLessonDetails(serializedLessonDetails)).resolves.toStrictEqual(
        lessonWithWeekRange,
      );
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
      expect(deserializeLessonDetails(serializedLessonDetails)).resolves.toStrictEqual(
        lessonWithWeekRange,
      );
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
      expect(deserializeLessonDetails(serializedLessonDetails)).resolves.toStrictEqual(
        lessonWithWeekRange,
      );
    });

    test('lesson with WeekRange with no week numbers list defined', () => {
      const lessonWithWeekRange = {
        ...lesson,
        weeks: {
          start: '2026-06-18',
          end: '2026-05-21',
          weekInterval: 2,
        },
      };
      const serializedLessonDetails = serializeLessonDetails(lessonWithWeekRange);

      expect(serializedLessonDetails).toBe('1|MON|1830|2030|VCRm|2026-06-18_2026-05-21_2');
      expect(deserializeLessonDetails(serializedLessonDetails)).resolves.toStrictEqual(
        lessonWithWeekRange,
      );
    });
  });
});
