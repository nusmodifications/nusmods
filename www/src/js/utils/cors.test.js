// @flow
/** @var {Module} */
import ges1021 from '__mocks__/modules/GES1021.json';
/** @var {Module} */
import acc2002 from '__mocks__/modules/ACC2002.json';

import { mergeBiddingStats, findQuota } from './cors';

test('mergeBiddingStats should merge bidding from different groups', () => {
  const mergedStats = mergeBiddingStats(acc2002.CorsBiddingStats);

  expect(
    mergedStats.find(
      (stats) => stats.Round === '2A' && stats.AcadYear === '2017/2018' && stats.Semester === '1',
    ),
  ).toMatchObject({
    LowestSuccessfulBid: 1,
    Bidders: 16,
    Quota: 15,
  });
});

test('findQuota should handle modules with no round 1 bidding correctly', () => {
  const ay2015s2 = mergeBiddingStats(ges1021.CorsBiddingStats).filter(
    (stats) => stats.AcadYear === '2015/2016' && stats.Semester === '2',
  );

  const quota = findQuota(ay2015s2);
  expect(quota).toEqual(355); // Taken from AY15/16 Sem 2 Round 2A quota
});

test('findQuota should use round 1 quota estimates if available', () => {
  const ay2017 = mergeBiddingStats(acc2002.CorsBiddingStats).filter(
    (stats) => stats.Semester === '1' && stats.AcadYear === '2017/2018',
  );

  // Sum of three sectional group in round 1A
  // Round 1C numbers should NOT be added here because they are rolled over numbers
  // rather than quota reserved for new students
  expect(findQuota(ay2017)).toEqual(15);
});
