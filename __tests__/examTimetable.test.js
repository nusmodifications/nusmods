import fs from 'fs-extra';
import {
  parseExamPdf,
  DATE_REGEX,
  TIME_REGEX,
  CODE_REGEX,
  TITLE_REGEX,
  FACULTY_REGEX,
} from '../gulp-tasks/remote/examTimetable';
import examDataFile1 from './test-files/examData1.json';
import examDataFile2 from './test-files/examData2.json';

jest.unmock('fs-extra');

const testFile1 = fs.readFileSync('__tests__/test-files/test1.pdf');
const testFile2 = fs.readFileSync('__tests__/test-files/test2.pdf');

describe('parseExamPdf', () => {
  const sublog = { warn: jest.fn() };
  it('scrapes all the modules', async () => {
    const examData1 = await parseExamPdf(testFile1, sublog);
    expect(examData1).toEqual(examDataFile1);
  });

  it('scrapes all the modules', async () => {
    const examData2 = await parseExamPdf(testFile2, sublog);
    expect(examData2).toEqual(examDataFile2);
  });
});

function passRegex(regex, str) {
  expect(regex.test(str)).toBe(true);
}

function failRegex(regex, str) {
  return () => expect(regex.test(str)).toBe(false);
}

describe('date regex', () => {
  it('captures date-like sequences', () => {
    passRegex(DATE_REGEX, '09-09-2016');
    passRegex(DATE_REGEX, '9-9-2016');
    passRegex(DATE_REGEX, '09/09/2016');
    passRegex(DATE_REGEX, '09-09-16');
  });

  it('fails with wrong month', failRegex(DATE_REGEX, '00-000-2000'));
  it('fails with wrong date', failRegex(DATE_REGEX, '-00-2000'));
  it('fails with wrong year', failRegex(DATE_REGEX, '00-00-'));
  it('fails with wrong delimiters', failRegex(DATE_REGEX, '00x00x2000'));
});

describe('time regex', () => {
  it('captures time-like sequences', () => {
    passRegex(TIME_REGEX, '0900AM');
    passRegex(TIME_REGEX, '09:00AM');
    passRegex(TIME_REGEX, '900 AM');
    passRegex(TIME_REGEX, '1400PM');
    passRegex(TIME_REGEX, '0900');
  });

  it('matches only timing in case of wrong period', () => {
    const match = TIME_REGEX.exec('0900BM')[0];
    expect(match).toBe('0900');
  });
  it('fails with no digits', failRegex(TIME_REGEX, '00PM'));
  it('fails with wrong digits', failRegex(TIME_REGEX, '0000PM'));
});

describe('code regex', () => {
  it('captures code-like sequences', () => {
    passRegex(CODE_REGEX, 'CS1010');
    passRegex(CODE_REGEX, 'CS1010S');
    passRegex(CODE_REGEX, 'GER1010');
  });

  it('fails with wrong digits', failRegex(CODE_REGEX, 'CS10'));
  it('fails with no digits', failRegex(CODE_REGEX, 'CS'));
  it('fails with no prefix', failRegex(CODE_REGEX, '1010'));
});

describe('title regex', () => {
  it('captures title-like sequences', () => {
    passRegex(TITLE_REGEX, 'TEST()');
    passRegex(TITLE_REGEX, 'TEST[]');
    passRegex(TITLE_REGEX, '1TEST:');
    passRegex(TITLE_REGEX, 'TEST');
  });

  it('fails with no uppercase', failRegex(TITLE_REGEX, 'test'));
  it('fails with empty string', failRegex(TITLE_REGEX, ''));
});
