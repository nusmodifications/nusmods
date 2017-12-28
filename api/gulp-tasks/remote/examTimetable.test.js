import fs from 'fs-extra';
import {
  parseExamPdf,
  DATE_REGEX,
  TIME_REGEX,
  CODE_REGEX,
  TITLE_REGEX,
  // Regex too simple to justify testing
  FACULTY_REGEX, // eslint-disable-line
} from './examTimetable';

jest.unmock('fs-extra');

describe('parseExamPdf', () => {
  const sublog = { warn: jest.fn() };
  function matchPdfOutput(filePath) {
    return fs
      .readFile(filePath)
      .then(fileContent => parseExamPdf(fileContent, sublog))
      .then((result) => {
        expect(result).toMatchSnapshot();
      });
  }

  it('scrapes all the modules for 2016 sem 1', () =>
    matchPdfOutput('__mocks__/fixtures/test1.pdf'));
  it('scrapes all the modules for 2017 sem 1', () =>
    matchPdfOutput('__mocks__/fixtures/test2.pdf'));
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
