// @flow

import { getAcadYearModules } from 'selectors/planner';

/* eslint-disable no-useless-computed-key */

describe(getAcadYearModules, () => {
  test('should add semester 1 and 2 for empty years', () => {
    expect(
      getAcadYearModules({
        minYear: '2018/2019',
        maxYear: '2018/2019',
        modules: {},
      }),
    ).toEqual({
      '2018/2019': {
        [1]: [],
        [2]: [],
      },
    });

    expect(
      getAcadYearModules({
        minYear: '2016/2017',
        maxYear: '2018/2019',
        modules: {},
      }),
    ).toEqual({
      '2016/2017': {
        [1]: [],
        [2]: [],
      },
      '2017/2018': {
        [1]: [],
        [2]: [],
      },
      '2018/2019': {
        [1]: [],
        [2]: [],
      },
    });
  });

  test('should map modules to years and semesters', () => {
    expect(
      getAcadYearModules({
        minYear: '2018/2019',
        maxYear: '2018/2019',
        modules: {
          CS1010S: ['2018/2019', 1, 0],
        },
      }),
    ).toEqual({
      '2018/2019': {
        [1]: ['CS1010S'],
        [2]: [],
      },
    });

    expect(
      getAcadYearModules({
        minYear: '2018/2019',
        maxYear: '2018/2019',
        modules: {
          CS1010X: ['2018/2019', 3, 0],
        },
      }),
    ).toEqual({
      '2018/2019': {
        [1]: [],
        [2]: [],
        [3]: ['CS1010X'],
      },
    });
  });

  test('should map modules in the correct order', () => {
    expect(
      getAcadYearModules({
        minYear: '2018/2019',
        maxYear: '2018/2019',
        modules: {
          CS1010S: ['2018/2019', 1, 1],
          MA1521: ['2018/2019', 1, 0],
          MA1101R: ['2018/2019', 1, 2],
        },
      }),
    ).toEqual({
      '2018/2019': {
        [1]: ['MA1521', 'CS1010S', 'MA1101R'],
        [2]: [],
      },
    });
  });
});
