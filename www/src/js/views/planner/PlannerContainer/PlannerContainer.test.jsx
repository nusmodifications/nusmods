// @flow

import { addYearLabel } from './PlannerContainer';

describe(addYearLabel, () => {
  test('should remove 20 prefix from AY', () => {
    expect(addYearLabel('2018/2019')).toEqual('18/19');

    // Don't remove every '20' in the string
    expect(addYearLabel('2019/2020')).toEqual('19/20');
  });
});
