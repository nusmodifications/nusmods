import {
  getAcadYearStartDate,
  getAcadYear,
  getAcadSem,
  getAcadWeekName,
  getAcadWeekInfo,
  getExamWeek,
} from './academicCalendar';

/* eslint-disable no-console */
console.warn = vi.fn();

describe('getAcadYearStartDate', () => {
  it('gets the starting date of an academic year', () => {
    expect(getAcadYearStartDate('14/15')).toEqual(new Date('August 4, 2014'));
    expect(getAcadYearStartDate('15/16')).toEqual(new Date('August 3, 2015'));
    expect(getAcadYearStartDate('16/17')).toEqual(new Date('August 1, 2016'));
    expect(getAcadYearStartDate('17/18')).toEqual(new Date('August 7, 2017'));
    expect(getAcadYearStartDate('18/19')).toEqual(new Date('August 6, 2018'));
    expect(getAcadYearStartDate('19/20')).toEqual(new Date('August 5, 2019'));
  });
});

describe('getAcadYear', () => {
  it('determines the correct start date for supported dates', () => {
    expect(getAcadYear(new Date('July 31, 2016')).year).toBe('15/16');
    expect(getAcadYear(new Date('August 1, 2016')).year).toBe('16/17');
    expect(getAcadYear(new Date('October 17, 2016')).year).toBe('16/17');
    expect(getAcadYear(new Date('July 31, 2017')).year).toBe('16/17');
    expect(getAcadYear(new Date('October 17, 2017')).year).toBe('17/18');
  });
});

describe('getAcadSem', () => {
  it('determines the correct semester for supported weeks', () => {
    expect(getAcadSem(1)).toBe('Semester 1');
    expect(getAcadSem(15)).toBe('Semester 1');
    expect(getAcadSem(23)).toBe('Semester 1');
    expect(getAcadSem(24)).toBe('Semester 2');
    expect(getAcadSem(32)).toBe('Semester 2');
    expect(getAcadSem(40)).toBe('Semester 2');
    expect(getAcadSem(41)).toBe('Special Term I');
    expect(getAcadSem(43)).toBe('Special Term I');
    expect(getAcadSem(46)).toBe('Special Term I');
    expect(getAcadSem(47)).toBe('Special Term II');
    expect(getAcadSem(50)).toBe('Special Term II');
    expect(getAcadSem(52)).toBe('Special Term II');
  });

  it('gives null for unsupported weeks', () => {
    expect(getAcadSem(-1)).toBe(null);
    expect(getAcadSem(0)).toBe(null);
    expect(getAcadSem(54)).toBe(null);
    expect(getAcadSem(1000)).toBe(null);
    expect(console.warn).toBeCalled();
  });
});

describe('getAcadWeekName', () => {
  it('determines the correct semester for supported weeks', () => {
    expect(getAcadWeekName(1)).toEqual({ weekNumber: 1, weekType: 'Instructional' });
    expect(getAcadWeekName(3)).toEqual({ weekNumber: 3, weekType: 'Instructional' });
    expect(getAcadWeekName(7)).toEqual({ weekNumber: null, weekType: 'Recess' });
    expect(getAcadWeekName(8)).toEqual({ weekNumber: 7, weekType: 'Instructional' });
    expect(getAcadWeekName(11)).toEqual({ weekNumber: 10, weekType: 'Instructional' });
    expect(getAcadWeekName(15)).toEqual({ weekNumber: null, weekType: 'Reading' });
    expect(getAcadWeekName(16)).toEqual({ weekNumber: 1, weekType: 'Examination' });
    expect(getAcadWeekName(17)).toEqual({ weekNumber: 2, weekType: 'Examination' });
  });

  it('gives null for unsupported weeks', () => {
    expect(getAcadWeekName(-1)).toBe(null);
    expect(getAcadWeekName(0)).toBe(null);
    expect(getAcadWeekName(18)).toBe(null);
    expect(getAcadWeekName(1000)).toBe(null);
    expect(console.warn).toBeCalled();
  });
});

describe('getAcadWeekInfo', () => {
  it('determines the correct week info for supported weeks', () => {
    expect(getAcadWeekInfo(new Date('August 1, 2016'))).toEqual({
      num: null,
      sem: 'Semester 1',
      type: 'Orientation',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('August 8, 2016'))).toEqual({
      num: 1,
      sem: 'Semester 1',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('August 14, 2016'))).toEqual({
      num: 1,
      sem: 'Semester 1',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('September 12, 2016'))).toEqual({
      num: 6,
      sem: 'Semester 1',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('September 19, 2016'))).toEqual({
      num: null,
      sem: 'Semester 1',
      type: 'Recess',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('September 27, 2016'))).toEqual({
      num: 7,
      sem: 'Semester 1',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('November 11, 2016'))).toEqual({
      num: 13,
      sem: 'Semester 1',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('November 14, 2016'))).toEqual({
      num: null,
      sem: 'Semester 1',
      type: 'Reading',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('November 21, 2016'))).toEqual({
      num: 1,
      sem: 'Semester 1',
      type: 'Examination',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('December 2, 2016'))).toEqual({
      num: 2,
      sem: 'Semester 1',
      type: 'Examination',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('December 7, 2016'))).toEqual({
      num: 1,
      sem: 'Semester 1',
      type: 'Vacation',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('December 28, 2016'))).toEqual({
      num: 4,
      sem: 'Semester 1',
      type: 'Vacation',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('January 4, 2017'))).toEqual({
      num: 5,
      sem: 'Semester 1',
      type: 'Vacation',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('January 9, 2017'))).toEqual({
      num: 1,
      sem: 'Semester 2',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('February 14, 2017'))).toEqual({
      num: 6,
      sem: 'Semester 2',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('February 21, 2017'))).toEqual({
      num: null,
      sem: 'Semester 2',
      type: 'Recess',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('February 28, 2017'))).toEqual({
      num: 7,
      sem: 'Semester 2',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('April 11, 2017'))).toEqual({
      num: 13,
      sem: 'Semester 2',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('April 18, 2017'))).toEqual({
      num: null,
      sem: 'Semester 2',
      type: 'Reading',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('April 25, 2017'))).toEqual({
      num: 1,
      sem: 'Semester 2',
      type: 'Examination',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('May 2, 2017'))).toEqual({
      num: 2,
      sem: 'Semester 2',
      type: 'Examination',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('May 9, 2017'))).toEqual({
      num: 1,
      sem: 'Special Term I',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('June 6, 2017'))).toEqual({
      num: 5,
      sem: 'Special Term I',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('June 13, 2017'))).toEqual({
      num: 6,
      sem: 'Special Term I',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('June 20, 2017'))).toEqual({
      num: 1,
      sem: 'Special Term II',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('July 25, 2017'))).toEqual({
      num: 6,
      sem: 'Special Term II',
      type: 'Instructional',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('August 4, 2017'))).toEqual({
      num: null,
      sem: null,
      type: 'Vacation',
      year: '16/17',
    });
    expect(getAcadWeekInfo(new Date('August 7, 2017'))).toEqual({
      num: null,
      sem: 'Semester 1',
      type: 'Orientation',
      year: '17/18',
    });
    expect(getAcadWeekInfo(new Date('September 8, 2024'))).toEqual({
      num: 4,
      sem: 'Semester 1',
      type: 'Instructional',
      year: '24/25',
    });
  });

  it('correctly handles week types whose days include the preceding weekend', () => {
    expect(getAcadWeekInfo(new Date('September 21, 2024'))).toEqual({
      num: null,
      sem: 'Semester 1',
      type: 'Recess',
      year: '24/25',
    });
    expect(getAcadWeekInfo(new Date('November 16, 2024'))).toEqual({
      num: null,
      sem: 'Semester 1',
      type: 'Reading',
      year: '24/25',
    });
    expect(getAcadWeekInfo(new Date('November 23, 2024'))).toEqual({
      num: 1,
      sem: 'Semester 1',
      type: 'Examination',
      year: '24/25',
    });
    expect(getAcadWeekInfo(new Date('February 25, 2025'))).toEqual({
      num: null,
      sem: 'Semester 2',
      type: 'Recess',
      year: '24/25',
    });
    expect(getAcadWeekInfo(new Date('April 19, 2025'))).toEqual({
      num: null,
      sem: 'Semester 2',
      type: 'Reading',
      year: '24/25',
    });
    expect(getAcadWeekInfo(new Date('April 27, 2025'))).toEqual({
      num: 1,
      sem: 'Semester 2',
      type: 'Examination',
      year: '24/25',
    });
  });
});

describe('getExamWeek', () => {
  it('returns the first day of exams', () => {
    expect(getExamWeek('17/18', 1)).toEqual(new Date('November 27, 2017'));
    expect(getExamWeek('17/18', 2)).toEqual(new Date('30 April, 2018'));
    expect(getExamWeek('17/18', 3)).toEqual(new Date('18 June, 2018'));
    expect(getExamWeek('16/17', 4)).toEqual(new Date('24 July, 2017'));
  });

  it('returns null for unknown semesters', () => {
    expect(getExamWeek('16/17', 0)).toBeNull();
    expect(getExamWeek('16/17', 5)).toBeNull();
  });
});
