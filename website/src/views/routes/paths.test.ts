import { modulePage, timetablePage, semesterForTimetablePage, venuePage } from './paths';

test('modulePagePath should generate route correctly', () => {
  expect(modulePage('CS1010S', 'Programming Methodology')).toBe(
    '/courses/CS1010S/programming-methodology',
  );
});

test('timetablePage <-> semesterForTimetablePage', () => {
  const semesters = [1, 2, 3, 4];
  semesters.forEach((semester) => {
    const path = timetablePage(semester);
    const param = path.match(/timetable\/(.*)/)![1];
    expect(semesterForTimetablePage(param)).toBe(semester);
  });
});

test('venuePage', () => {
  expect(venuePage()).toEqual('/venues');
  expect(venuePage(null)).toEqual('/venues');
  expect(venuePage('abc')).toEqual('/venues/abc');
  expect(venuePage('abc/def')).toEqual('/venues/abc%2Fdef');
});
