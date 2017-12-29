// @flow
import type { ExportData } from 'types/export';
import { serializeExportState, deserializeExportState } from './export';

test('Export deserialization and deserialization', () => {
  const state: ExportData = {
    semester: 1,
    timetable: {
      CS1010S: {
        Lecture: '1',
        Recitation: '2',
        Tutorial: '1',
      },
      CS3216: {
        Lecture: '1',
      },
    },
    theme: {
      id: '3',
      colors: {
        CS1010S: 0,
        CS3216: 1,
      },
      timetableOrientation: 'HORIZONTAL',
    },
    hiddenInTimetable: ['CS1010S'],
    mode: 'LIGHT',
  };

  expect(deserializeExportState(serializeExportState(state))).toEqual(state);
});
