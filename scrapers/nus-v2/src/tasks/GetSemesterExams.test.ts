import { mapExamInfo } from './GetSemesterExams';

/* eslint-disable camelcase */

describe(mapExamInfo, () => {
  test('should map module exam to date strings', () => {
    const actual = mapExamInfo({
      term: '1810',
      start_time: '17:00',
      acad_org: '00301ACAD1',
      module: 'CS2100',
      end_time: '19:00',
      duration: 120,
      exam_date: '2018-11-27',
    });

    expect(actual).toEqual({
      examDate: '2018-11-27T09:00:00.000Z',
      examDuration: 120,
    });
  });
});
