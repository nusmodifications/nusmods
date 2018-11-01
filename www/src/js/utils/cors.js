// @flow
import { first, groupBy, head, last, map, mapValues, min, sumBy } from 'lodash';

import type { CorsRound, CorsPeriod } from 'config';
import type {
  BiddingStat,
  GroupedBiddingStat,
  SemesterStats,
  StudentType,
  BiddingSummary,
} from 'types/cors';
import {
  studentTypes,
  NON_BIDDING,
  NEW_STUDENT,
  RETURNING_STUDENT,
  GENERAL_ACCOUNT,
} from 'types/cors';
import config from 'config';

function appliesTo(studentAccountType: string): StudentType {
  switch (studentAccountType) {
    case 'Returning Students [P]':
      return RETURNING_STUDENT;
    case 'New Students [P]':
      return NEW_STUDENT;
    case 'NUS Students [P]':
    case 'Returning Students and New Students [P]':
      return NEW_STUDENT | RETURNING_STUDENT;
    case 'NUS Students [G]':
      return GENERAL_ACCOUNT;
    case 'Returning Students [P] and NUS Students [G]':
      return RETURNING_STUDENT | GENERAL_ACCOUNT;
    case 'NUS Students [P, G]':
      return NEW_STUDENT | RETURNING_STUDENT | GENERAL_ACCOUNT;
    case 'Reserved for [G] in later round':
    case 'Not Available for [G]':
      return 0;
    default:
      throw Error(`unknown StudentAcctType ${studentAccountType}`);
  }
}

export function mergeBiddingStats(biddingStats: BiddingStat[]): GroupedBiddingStat[] {
  // Merge quotas and data from each lecture/sectional group - these groups are interchangeable
  // so its better to take their combined statistics instead
  const groupedStats = groupBy(biddingStats, (stats: BiddingStat) =>
    [stats.AcadYear, stats.Semester, stats.Faculty, stats.Round, stats.StudentAcctType].join('-'),
  );
  return map(groupedStats, (statsGroup: BiddingStat[]): GroupedBiddingStat => {
    // eslint-disable-next-line no-shadow
    const { AcadYear, Faculty, Semester, Round, StudentAcctType } = head(statsGroup);

    return {
      AcadYear,
      Faculty,
      Semester,
      Round,

      StudentType: appliesTo(StudentAcctType),
      Quota: sumBy(statsGroup, (stats) => Number(stats.Quota)),
      Bidders: sumBy(statsGroup, (stats) => Number(stats.Bidders)),
      LowestSuccessfulBid: min(statsGroup.map((stats) => Number(stats.LowestSuccessfulBid))),
    };
  }).filter((stat) => stat.StudentType !== NON_BIDDING);
}

export function findQuota(stats: GroupedBiddingStat[]): number {
  const firstRound = min(stats.map((stat) => stat.Round));
  return sumBy(stats, (stat) => {
    if (stat.Round === firstRound) return stat.Quota;

    // Also include quota from any 1C rounds for new students
    if (stat.Round === '1C' && stat.StudentType & NEW_STUDENT) return stat.Quota;

    return 0;
  });
}

export function biddingSummary(stats: GroupedBiddingStat[]): BiddingSummary {
  // Find the minimum bid amount for each type of student (new, returning program, returning general)
  // and the round at which it occurred at for each faculty
  const summary = {};

  function updateMinimumBid(stat, type) {
    if (!summary[stat.Faculty]) {
      summary[stat.Faculty] = {};
    }

    // If there are no bidders for a round, we assume anyone could have gotten it for 1 pt
    // (even though nobody actually bid for it)
    const minBid = stat.Bidders ? stat.LowestSuccessfulBid : 1;

    // Update the summary with the new minimum bid
    if (!summary[stat.Faculty][type] || minBid < summary[stat.Faculty][type].minBid) {
      summary[stat.Faculty][type] = {
        minBid,
        round: stat.Round,
      };
    }
  }

  stats.forEach((stat) => {
    // Ignore non-bidding rounds
    if (stat.StudentType & NON_BIDDING) return;

    studentTypes.forEach((type) => {
      if (stat.StudentType & type) updateMinimumBid(stat, type);
    });
  });

  return summary;
}

export function analyseStats(biddingStats: BiddingStat[]): { [string]: SemesterStats } {
  const mergedStats = mergeBiddingStats(biddingStats);

  // Group by year and semester
  const groupedBySem = groupBy(
    mergedStats,
    (stats: GroupedBiddingStat) =>
      `${stats.AcadYear} ${config.shortSemesterNames[Number(stats.Semester)]}`,
  );

  const extractStats = mapValues(groupedBySem, (stats: GroupedBiddingStat[]): SemesterStats => {
    // Check if there are multiple faculties
    const faculties = new Set();
    stats.forEach((stat) => faculties.add(stat.Faculty));

    // Find out how many people have managed to take the module to get a rough idea of
    // heavily subscribed a module is. This number of bidders may be higher than quota because
    // students can drop modules during bidding, so we cap it at quota
    const quota = findQuota(stats);
    const bids = Math.min(
      quota,
      sumBy(stats, (stat) => Math.min(Number(stat.Bidders), Number(stat.Quota))),
    );

    const summary = biddingSummary(stats);

    return {
      quota,
      bids,
      faculties,
      stats,
      summary,
    };
  });

  return extractStats;
}

export function roundStart(round: CorsRound): Date {
  return first(round.periods).startDate;
}

export function roundEnd(round: CorsRound): Date {
  return last(round.periods).endDate;
}

export function currentRound(now: Date = new Date()): ?CorsRound {
  return config.corsSchedule.find((round) => roundEnd(round) > now);
}

export function currentPeriod(round: CorsRound, now: Date = new Date()): ?CorsPeriod {
  return round.periods.find((period) => period.endDate > now);
}
