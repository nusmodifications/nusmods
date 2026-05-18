import { getClosestLessonConfig, getRecoveryLessonIndices } from './lessonIndices';

describe('getClosestLessonConfig', () => {
  test('ignore if lesson type has no classNo', () => {
    expect(getClosestLessonConfig({ Lecture: {} }, { Lecture: [0] })).toEqual({});
  });
});

describe('getRecoveryLessonIndices', () => {
  test('guard against empty lessons input', () => {
    expect(getRecoveryLessonIndices([])).toEqual([]);
  });
});
