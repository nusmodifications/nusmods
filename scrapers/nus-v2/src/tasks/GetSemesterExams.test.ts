import { mapExamInfo } from './GetSemesterExams';

describe(mapExamInfo, () => {
  test('should map module exam to date strings', () => {
    const actual = mapExamInfo({
      acad_org: '00301ACAD1',
      duration: 120,
      end_time: '19:00',
      exam_date: '2018-11-27',
      module: 'CS2100',
      start_time: '17:00',
      term: '1810',
    });

    expect(actual).toEqual({
      examDate: '2018-11-27T09:00:00.000Z',
      examDuration: 120,
    });
  });
});
