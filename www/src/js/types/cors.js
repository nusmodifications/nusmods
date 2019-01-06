// @flow

import type { AcadYear, Faculty } from './modules';

// Raw CORS bidding stats from the scraper
export type BiddingStat = {
  AcadYear: AcadYear,
  Bidders: string,
  Faculty: Faculty,
  Group: string,
  HighestBid: string,
  LowestBid: string,
  LowestSuccessfulBid: string,
  Quota: string,
  Round: string,
  Semester: string, // Note that this semester type is different from that in SemesterData.
  StudentAcctType: string,
};

// The student type which a bidding round is applicable to. This is expressed as a bitmask,
// since a round can apply to more than one of these student types.
// Usage:
//   To test a bitmask, use bitwise & operator - eg.
//     if (studentType & NEW_STUDENT) // If the studentType contains NEW_STUDENTS
//   To set a bitmask, use bitwise | operator - eg.
//     studentType = NEW_STUDENT | RETURNING_STUDENT // This studentType contains both new and returning students
//
// See http://www.alanzucconi.com/2015/07/26/enum-flags-and-bitwise-operators/
// for more info on bitmasks
export type StudentType = number;
export const NON_BIDDING: StudentType = 0; // Non-bidding round (eg. reserved quota for next rounds)
export const NEW_STUDENT: StudentType = 1 << 0;
export const RETURNING_STUDENT: StudentType = 1 << 1;
export const GENERAL_ACCOUNT: StudentType = 1 << 2;
export const studentTypes = [NEW_STUDENT, RETURNING_STUDENT, GENERAL_ACCOUNT];

// Simplified version of BiddingStat from modules
export type GroupedBiddingStat = {|
  +AcadYear: AcadYear,
  +Faculty: Faculty,
  +Semester: string,
  +StudentType: StudentType,
  +Round: string,
  +Quota: number,
  +Bidders: number,
  +LowestSuccessfulBid: number,
|};

export type BiddingSummary = {
  +[Faculty]: {
    +[StudentType]: {
      +minBid: number,
      +round: string,
    },
  },
};

export type SemesterStats = {|
  +quota: number,
  +bids: number,
  +faculties: Set<Faculty>,
  +stats: GroupedBiddingStat[],
  +summary: BiddingSummary,
|};
