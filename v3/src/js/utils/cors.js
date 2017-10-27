// @flow
import { last } from 'lodash';

import type { BiddingStat, Student } from 'types/modules';
import type { CorsRound } from 'config';

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

export function roundEnd(round: CorsRound): Date {
  return last(round.periods).endDate;
}
