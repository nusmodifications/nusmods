// @flow
import { first, groupBy, head, last, map, mapValues, min, sumBy } from 'lodash';

import type { BiddingStat, Student } from 'types/modules';
import type { CorsRound } from 'config';
import type { GroupedBiddingStat, SemesterStats, StudentType, BiddingSummary } from 'types/views';
import { NEW_STUDENT, RETURNING_STUDENT, GENERAL_ACCOUNT } from 'types/views';
import config from 'config';

const sameFaculty = (stat: BiddingStat, student: Student): boolean => (stat.Faculty === student.faculty);
const isNew = student => (student.newStudent);
const PROGRAMME = 'P';
const GENERAL = 'G';
const isProgrammeAccount = student => (student.accountType === PROGRAMME);
const isGeneralAccount = student => (student.accountType === GENERAL);

export function isStatRelevantForStudent(stat: BiddingStat, student: Student) {
  switch (stat.StudentAcctType) {
    case 'Returning Students [P]':
      return sameFaculty(stat, student) && isProgrammeAccount(student) && !isNew(student);
    case 'New Students [P]':
      return sameFaculty(stat, student) && isProgrammeAccount(student) && isNew(student);
    case 'NUS Students [P]':
      return sameFaculty(stat, student) && isProgrammeAccount(student);
    case 'Returning Students and New Students [P]':
      return sameFaculty(stat, student) && isProgrammeAccount(student);
    case 'NUS Students [G]':
      return isGeneralAccount(student);
    case 'Returning Students [P] and NUS Students [G]':
      return (sameFaculty(stat, student) && isProgrammeAccount(student) && !isNew(student))
        || (!sameFaculty(stat, student) && isGeneralAccount(student));
    case 'NUS Students [P, G]':
      return (sameFaculty(stat, student) && isProgrammeAccount(student))
        || (!sameFaculty(stat, student) && isGeneralAccount(student));
    case 'Reserved for [G] in later round':
      return !sameFaculty(stat, student) && isGeneralAccount(student);
    case 'Not Available for [G]':
      return sameFaculty(stat, student) && isProgrammeAccount(student);
    default:
      throw Error(`unknown StudentAcctType ${stat.StudentAcctType}`);
  }
}

function appliesTo(stats: GroupedBiddingStat): StudentType {
  switch (stats.StudentAcctType) {
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
      throw Error(`unknown StudentAcctType ${stats.StudentAcctType}`);
  }
}

export function biddingSummary(stats: GroupedBiddingStat[]): BiddingSummary {
  // Find the minimum bid amount for each type of student (new, returning program, returning general)
  // and the round at which it occurred at for each faculty
  const summary = {};

  function updateSummary(stat, type) {
    if (!summary[stat.Faculty]) {
      summary[stat.Faculty] = {};
    }

    if (!summary[stat.Faculty][type] ||
        stat.LowestSuccessfulBid < summary[stat.Faculty][type].minBid) {
      summary[stat.Faculty][type] = {
        minBid: stat.LowestSuccessfulBid,
        round: stat.Round,
      };
    }
  }

  stats.forEach((stat) => {
    if (stat.Bidders === 0) return;
    const studentTypes = appliesTo(stat);

    if (studentTypes & NEW_STUDENT) updateSummary(stat, NEW_STUDENT);
    if (studentTypes & RETURNING_STUDENT) updateSummary(stat, RETURNING_STUDENT);
    if (studentTypes & GENERAL_ACCOUNT) updateSummary(stat, GENERAL_ACCOUNT);
  });

  return summary;
}

export function analyseStats(biddingStats: BiddingStat[]): { [string]: SemesterStats } {
  // Merge quotas and data from each lecture/sectional group - these groups are interchangeable
  // so its better to take their combined numbers instead
  const groupedStats = groupBy(biddingStats, (stats: BiddingStat) =>
    [stats.AcadYear, stats.Semester, stats.Faculty, stats.Round, stats.StudentAcctType].join('-'));
  const mergedStats = map(groupedStats, (statsGroup: BiddingStat[]): GroupedBiddingStat => {
    // eslint-disable-next-line no-shadow
    const { AcadYear, Faculty, Semester, Round, StudentAcctType } = head(statsGroup);
    const Quota = sumBy(statsGroup, stats => Number(stats.Quota));
    const Bidders = sumBy(statsGroup, stats => Number(stats.Bidders));
    const LowestSuccessfulBid = min(statsGroup.map(stats => Number(stats.LowestSuccessfulBid)));

    return {
      AcadYear,
      Faculty,
      Semester,
      Round,
      StudentAcctType,
      Quota,
      Bidders,
      LowestSuccessfulBid,
    };
  });

  // Group by year and semester
  const groupedBySem = groupBy(mergedStats, (stats: GroupedBiddingStat) =>
    `${stats.AcadYear} ${config.shortSemesterNames[Number(stats.Semester)]}`);

  const extractStats = mapValues(groupedBySem, (stats: GroupedBiddingStat[]): SemesterStats => {
    // Check if there are multiple faculties
    const faculties = new Set();
    stats.forEach(stat => faculties.add(stat.Faculty));

    // We assume the total quota is reflected in the number of places available
    // in rounds 1A and 1C
    const quota = sumBy(stats, (stat) => {
      if (stat.Round === '1A' || stat.Round === '1C') return Number(stat.Quota);
      return 0;
    });

    // Find out how many people have managed to take the module to get a rough idea of
    // heavily subscribed a module is. This number may be higher than quota because
    // students can drop modules during bidding, so we cap it at quota
    const bids = Math.min(quota, sumBy(stats, stat => Math.min(Number(stat.Bidders), Number(stat.Quota))));

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
