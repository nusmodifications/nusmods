import { validateExam, validateLesson, validateSemester } from './validation';

/* eslint-disable camelcase */

describe(validateLesson, () => {
  test('should return false if the lesson is invalid', () => {
    const invalidLesson1: any = {
      term: '1810',
      room: null,
      numweeks: 13,
      start_time: '00:00',
      activity: 'L',
      csize: 40,
      module: 'SH5404',
      eventdate: null,
      session: '1',
      end_time: '00:00',
      modgrp: 'L1',
      deptfac: '00602ACAD1',
      day: null,
    };

    const invalidLesson2: any = {
      term: '1810',
      room: null,
      numweeks: 0,
      start_time: null,
      activity: 'L',
      csize: 40,
      module: 'EL4401',
      eventdate: null,
      session: '1',
      end_time: null,
      modgrp: 'L1',
      deptfac: '00104ACAD1',
      day: null,
    };

    const invalidLesson3: any = {
      term: '1810',
      room: null,
      numweeks: 0,
      start_time: '12:00',
      end_time: '12:00',
      activity: 'L',
      csize: 40,
      module: 'EL4401',
      eventdate: null,
      session: '1',
      modgrp: 'L1',
      deptfac: '00104ACAD1',
      day: null,
    };

    expect(validateLesson(invalidLesson1)).toBe(false);
    expect(validateLesson(invalidLesson2)).toBe(false);
    expect(validateLesson(invalidLesson3)).toBe(false);
  });

  test('should return true for valid lessons', () => {
    expect(
      validateLesson({
        term: '1810',
        room: 'S16-0436',
        numweeks: 13,
        start_time: '14:00',
        activity: 'R',
        csize: 50,
        module: 'CS1010S',
        eventdate: '2018-08-24',
        session: '1',
        end_time: '15:00',
        modgrp: 'R05',
        deptfac: '00301ACAD1',
        day: '5',
      }),
    ).toBe(true);
  });

  test('should allow lessons with null room', () => {
    expect(
      validateLesson({
        term: '1810',
        room: null,
        numweeks: 13,
        start_time: '13:00',
        activity: 'S',
        csize: 60,
        module: 'CN3109',
        eventdate: '2018-08-21',
        session: '1',
        end_time: '17:00',
        modgrp: 'S2',
        deptfac: '00602ACAD1',
        day: '2',
      }),
    ).toEqual(true);
  });
});

describe(validateExam, () => {
  test('should return false for invalid exams', () => {
    const invalidExam: any = {
      term: '1810',
      start_time: null,
      acad_org: '011',
      module: 'CS1010',
      end_time: null,
      duration: 0,
      exam_date: '2019-05-08',
    };

    expect(validateExam(invalidExam)).toBe(false);
  });

  test('should return true for valid exams', () => {
    expect(
      validateExam({
        term: '1810',
        start_time: '09:00',
        acad_org: '01700ACAD1',
        module: 'YID2210',
        end_time: '12:00',
        duration: 180,
        exam_date: '2018-11-29',
      }),
    ).toBe(true);

    expect(
      validateExam({
        term: '1810',
        start_time: '18:30',
        acad_org: '04100ACAD1',
        module: 'EB5204',
        end_time: '22:00',
        duration: 210,
        exam_date: '2018-11-22',
      }),
    ).toBe(true);
  });
});

describe(validateSemester, () => {
  test('should return true for valid semesters', () => {
    expect(validateSemester(1)).toBe(true);
    expect(validateSemester('1')).toBe(true);
    expect(validateSemester(4)).toBe(true);
    expect(validateSemester('4')).toBe(true);
  });

  test('should return false for anything else', () => {
    expect(validateSemester(5)).toBe(false);
    expect(validateSemester(0)).toBe(false);
    expect(validateSemester(1.5)).toBe(false);
    expect(validateSemester('Ahhh')).toBe(false);
    expect(validateSemester('Not semester')).toBe(false);
  });
});
