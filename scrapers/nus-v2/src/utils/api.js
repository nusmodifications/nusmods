// @flow

/**
 * Small utility functions that don't need to be part of the main API class
 */

/* eslint-disable import/prefer-default-export */

import type { Semester } from '../types/modules';

/**
 * Construct the 4 number term code from the academic year and semester
 */
export function getTermCode(semester: number | string, academicYear: string) {
  const year = /\d\d(\d\d)/.exec(academicYear);
  if (!year) throw new RangeError('academicYear should be in the format of YYYY/YYYY or YYYY-YY');
  return `${year[1]}${semester}0`;
}

export function fromTermCode(term: string): [string, Semester] {
  const year = parseInt(term.slice(0, 2), 10);
  const semester = parseInt(term.charAt(2), 10);

  return [`20${year}/20${year + 1}`, semester];
}
