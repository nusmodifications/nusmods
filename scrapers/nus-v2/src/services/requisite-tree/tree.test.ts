import { flattenTree } from './tree';

describe(flattenTree, () => {
  test('should return an array of module codes', () => {
    expect(flattenTree('CS1010')).toEqual(['CS1010']);
    expect(flattenTree(['CS1010', 'CS1020'])).toEqual(['CS1010', 'CS1020']);
  });

  test('should flatten branches', () => {
    expect(flattenTree({ or: ['CS1010', 'CS1020'] })).toEqual(['CS1010', 'CS1020']);
    expect(flattenTree({ and: ['CS1010', 'CS1020'] })).toEqual(['CS1010', 'CS1020']);
    expect(
      flattenTree({
        and: [
          {
            or: ['CS1020', 'CS2020'],
          },
          {
            or: ['CG1107', 'CS2100'],
          },
        ],
      }),
    ).toEqual(['CS1020', 'CS2020', 'CG1107', 'CS2100']);
  });

  test('should flatten mixed branches', () => {
    expect(flattenTree({ and: ['CS1010', { or: ['CS1020', 'CS2020'] }] })).toEqual([
      'CS1010',
      'CS1020',
      'CS2020',
    ]);
  });

  test('should flatten an nOf branch without choking on the count', () => {
    expect(flattenTree({ nOf: [2, ['CS1010', 'CS1020', 'CS2040']] })).toEqual([
      'CS1010',
      'CS1020',
      'CS2040',
    ]);
  });

  test('should flatten through a cohort gate without leaking the condition', () => {
    expect(
      flattenTree({
        cohort: { rule: 'IF_IN', years: ['S:2022'] },
        then: { and: ['LC1016:D', 'NTW%:D'] },
      }),
    ).toEqual(['LC1016:D', 'NTW%:D']);
  });

  test('should flatten an nOf requirement nested under a cohort gate', () => {
    expect(
      flattenTree({
        cohort: { rule: 'IF_IN', years: ['S:2022'] },
        then: { nOf: [2, ['LC1016:D', 'NTW%:D', 'NSW%:D']] },
      }),
    ).toEqual(['LC1016:D', 'NTW%:D', 'NSW%:D']);
  });

  test('should yield no module codes for a bare cohort constraint', () => {
    expect(
      flattenTree({
        and: ['CS1010:D', { cohort: { rule: 'MUST_BE_IN', years: ['S:2017'] } }],
      }),
    ).toEqual(['CS1010:D']);
  });
});
