import {
  modulePage,
  timetablePage,
  semesterForTimetablePage,
  isV2TimetablePageUrl,
  venuePage,
} from './paths';

test('modulePagePath should generate route correctly', () => {
  expect(modulePage('CS1010S', 'Programming Methodology')).toBe(
    '/modules/CS1010S/programming-methodology',
  );
});

test('timetablePage <-> semesterForTimetablePage', () => {
  const semesters = [1, 2, 3, 4];
  semesters.forEach((semester) => {
    const path = timetablePage(semester);
    const param = path.match(/timetable\/(.*)/)[1];
    expect(semesterForTimetablePage(param)).toBe(semester);
  });
});

test('isV2TimetablePageUrl', () => {
  expect(isV2TimetablePageUrl({})).toBe(false);
  expect(isV2TimetablePageUrl({ semester: '2017-2018', action: 'sem2' })).toBe(true);
  expect(isV2TimetablePageUrl({ semester: 'sem-2', action: 'share' })).toBe(false);
  expect(isV2TimetablePageUrl({ semester: 'sem-2' })).toBe(false);
});

test('venuePage', () => {
  expect(venuePage()).toEqual('/venues');
  expect(venuePage(null)).toEqual('/venues');
  expect(venuePage('abc')).toEqual('/venues/abc');
  expect(venuePage('abc/def')).toEqual('/venues/abc%2Fdef');
});
