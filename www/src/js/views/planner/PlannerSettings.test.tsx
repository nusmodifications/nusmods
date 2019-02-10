// @flow

import { getYearLabels } from 'views/planner/PlannerSettings';

describe(getYearLabels, () => {
  test('should support negative offset', () => {
    expect(getYearLabels(-2, 2)).toEqual([
      '2015/2016',
      '2016/2017',
      '2017/2018', // Current year
      '2018/2019',
      '2019/2020',
    ]);
  });
});
