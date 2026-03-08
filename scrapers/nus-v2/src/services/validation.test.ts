import { validateExam, validateLesson, validateSemester } from './validation';

describe(validateLesson, () => {
  test('should return false if the lesson is invalid', () => {
    const invalidLesson1: any = {
      activity: 'L',
      csize: 40,
      day: null,
      deptfac: '00602ACAD1',
      end_time: '00:00',
      eventdate: null,
      modgrp: 'L1',
      module: 'SH5404',
      numweeks: 13,
      room: null,
      session: '1',
      start_time: '00:00',
      term: '1810',
    };

    const invalidLesson2: any = {
      activity: 'L',
      csize: 40,
      day: null,
      deptfac: '00104ACAD1',
      end_time: null,
      eventdate: null,
      modgrp: 'L1',
      module: 'EL4401',
      numweeks: 0,
      room: null,
      session: '1',
      start_time: null,
      term: '1810',
    };

    const invalidLesson3: any = {
      activity: 'L',
      csize: 40,
      day: null,
      deptfac: '00104ACAD1',
      end_time: '12:00',
      eventdate: null,
      modgrp: 'L1',
      module: 'EL4401',
      numweeks: 0,
      room: null,
      session: '1',
      start_time: '12:00',
      term: '1810',
    };

    expect(validateLesson(invalidLesson1)).toBe(false);
    expect(validateLesson(invalidLesson2)).toBe(false);
    expect(validateLesson(invalidLesson3)).toBe(false);
  });

  test('should return true for valid lessons', () => {
    expect(
      validateLesson({
        activity: 'R',
        csize: 50,
        day: '5',
        deptfac: '00301ACAD1',
        end_time: '15:00',
        eventdate: '2018-08-24',
        modgrp: 'R05',
        module: 'CS1010S',
        numweeks: 13,
        room: 'S16-0436',
        session: '1',
        start_time: '14:00',
        term: '1810',
      }),
    ).toBe(true);
  });

  test('should allow lessons with null room', () => {
    expect(
      validateLesson({
        activity: 'S',
        csize: 60,
        day: '2',
        deptfac: '00602ACAD1',
        end_time: '17:00',
        eventdate: '2018-08-21',
        modgrp: 'S2',
        module: 'CN3109',
        numweeks: 13,
        room: null,
        session: '1',
        start_time: '13:00',
        term: '1810',
      }),
    ).toEqual(true);
  });
});

describe(validateExam, () => {
  test('should return false for invalid exams', () => {
    const invalidExam: any = {
      acad_org: '011',
      duration: 0,
      end_time: null,
      exam_date: '2019-05-08',
      module: 'CS1010',
      start_time: null,
      term: '1810',
    };

    expect(validateExam(invalidExam)).toBe(false);
  });

  test('should return true for valid exams', () => {
    expect(
      validateExam({
        acad_org: '01700ACAD1',
        duration: 180,
        end_time: '12:00',
        exam_date: '2018-11-29',
        module: 'YID2210',
        start_time: '09:00',
        term: '1810',
      }),
    ).toBe(true);

    expect(
      validateExam({
        acad_org: '04100ACAD1',
        duration: 210,
        end_time: '22:00',
        exam_date: '2018-11-22',
        module: 'EB5204',
        start_time: '18:30',
        term: '1810',
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
