// @flow

import moment from 'moment';
import { mapExamInfo } from './GetSemesterExams';

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

    expect(moment(actual.ExamDate, moment.ISO_8601).isValid()).toBe(true);

    expect(actual).toEqual({
      ExamDate: '2018-11-27T17:00:00.000+08:00',
      ExamDuration: 120,
    });
  });
});
