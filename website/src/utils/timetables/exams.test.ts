import { Semester } from 'types/modules';
import { findExamClashes } from './exams';
import { getModuleSemesterData } from 'utils/modules';
import { get } from 'lodash-es';
import { CS1010A, CS1010S, CS3216, CS4243, PC1222 } from '__mocks__/modules';

test('findExamClashes should return non-empty object if exams clash', () => {
  const sem: Semester = 1;
  const examClashes = findExamClashes([CS1010S, CS4243, CS3216], sem);
  const examDate = get(getModuleSemesterData(CS1010S, sem), 'examDate');
  if (!examDate) throw new Error('Cannot find ExamDate');
  expect(examClashes).toEqual({ [examDate]: [CS1010S, CS4243] });
});

test('findExamClashes should return empty object if exams do not clash', () => {
  const sem: Semester = 2;
  const examClashes = findExamClashes([CS1010S, PC1222, CS3216], sem);
  expect(examClashes).toEqual({});
});

test('findExamClashes should return non-empty object if exams starting at different times clash', () => {
  const sem: Semester = 1;
  const examClashes = findExamClashes([CS1010S, CS3216, CS1010A], sem);
  const examDate = get(getModuleSemesterData(CS1010A, sem), 'examDate');
  if (!examDate) throw new Error('Cannot find ExamDate');
  expect(examClashes).toEqual({ [examDate]: [CS1010S, CS1010A] });
});
