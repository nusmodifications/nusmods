// @flow

import { getAcadYearModules } from 'selectors/planner';

/* eslint-disable no-useless-computed-key */

describe(getAcadYearModules, () => {
  test('should add semesters for empty years', () => {
    const emptyYear = {
      [1]: [],
      [2]: [],
      [3]: [],
      [4]: [],
    };

    expect(
      getAcadYearModules({
        minYear: '2018/2019',
        maxYear: '2018/2019',
        modules: {},
      }),
    ).toEqual({
      '2018/2019': emptyYear,
    });

    expect(
      getAcadYearModules({
        minYear: '2016/2017',
        maxYear: '2018/2019',
        modules: {},
      }),
    ).toEqual({
      '2016/2017': emptyYear,
      '2017/2018': emptyYear,
      '2018/2019': emptyYear,
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
        [3]: [],
        [4]: [],
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
        [4]: [],
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
        [3]: [],
        [4]: [],
      },
    });
  });
});
