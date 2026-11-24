import NUSModsApi from './nusmods';

describe(NUSModsApi.courseRegHistoryUrl, () => {
  test('should return the CourseReg history API URL for a semester', () => {
    expect(NUSModsApi.courseRegHistoryUrl(2, '2025/2026')).toBe(
      'https://api.nusmods.com/v2/2025-2026/semesters/2/courseRegHistory.json',
    );
  });
});
