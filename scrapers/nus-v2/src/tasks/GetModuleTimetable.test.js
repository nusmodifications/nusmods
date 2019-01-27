// @flow

import GetModuleTimetable from './GetModuleTimetable';
import { makeMockFile } from '../utils/test-utils';

describe(GetModuleTimetable, () => {
  test('should not crash if the data is invalid', async () => {
    const task = new GetModuleTimetable('CS1010', 1, '2018/2019');
    const lessons: any = [
      // Invalid lesson
      {
        term: '1810',
        room: null,
        numweeks: 13,
        start_time: '00:00',
        activity: 'L',
        csize: 40,
        module: 'CS1010',
        eventdate: null,
        session: '1',
        end_time: '00:00',
        modgrp: 'L1',
        deptfac: '00602ACAD1',
        day: null,
      },
    ];

    const mockFile = makeMockFile([]);
    task.api.getModuleTimetable = jest.fn().mockResolvedValue(lessons);
    task.fs.output.timetable = jest.fn().mockReturnValue(mockFile);

    const results = await task.run();

    expect(results).toEqual([]);
  });
  test('should filter out invalid lessons', async () => {
    const task = new GetModuleTimetable('CS1010', 1, '2018/2019');
    const lessons: any = [
      // Invalid lesson
      {
        term: '1810',
        room: null,
        numweeks: 13,
        start_time: '00:00',
        activity: 'L',
        csize: 40,
        module: 'CS1010',
        eventdate: null,
        session: '1',
        end_time: '00:00',
        modgrp: 'L1',
        deptfac: '00602ACAD1',
        day: null,
      },
      // Valid lesson
      {
        term: '1810',
        room: 'S16-0436',
        numweeks: 13,
        start_time: '14:00',
        activity: 'R',
        csize: 50,
        module: 'CS1010',
        eventdate: '2018-08-24',
        session: '1',
        end_time: '15:00',
        modgrp: 'R05',
        deptfac: '00301ACAD1',
        day: '5',
      },
    ];

    const mockFile = makeMockFile([]);
    task.api.getModuleTimetable = jest.fn().mockResolvedValue(lessons);
    task.fs.output.timetable = jest.fn().mockReturnValue(mockFile);

    const results = await task.run();

    expect(results).toMatchSnapshot();
    expect(mockFile.write).toHaveBeenCalled();
  });
});
