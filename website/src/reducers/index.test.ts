import { ExportData } from 'types/export';
import { VERTICAL } from 'types/reducers';
import reducers from 'reducers';
import { setExportedData } from 'actions/export';
import modules from '__mocks__/modules/index';

/* eslint-disable no-useless-computed-key */

const exportData: ExportData = {
  semester: 1,
  timetable: {
    CS3216: {
      Lecture: ['1'],
    },
    CS1010S: {
      Lecture: ['1'],
      Tutorial: ['3'],
      Recitation: ['2'],
    },
    PC1222: {
      Lecture: ['1'],
      Tutorial: ['3'],
    },
  },
  colors: {
    CS3216: 1,
    CS1010S: 0,
    PC1222: 2,
  },
  hidden: ['PC1222'],
  theme: {
    id: 'google',
    timetableOrientation: VERTICAL,
    showTitle: true,
  },
  settings: {
    mode: 'DARK',
  },
};

jest.mock('storage/persistReducer', <T>() => (key: string, reducer: T) => reducer);

test('reducers should set export data state', () => {
  const state = reducers({} as any, setExportedData(modules, exportData));

  expect(state.timetables).toEqual({
    lessons: {
      [1]: {
        CS3216: {
          Lecture: ['1'],
        },
        CS1010S: {
          Lecture: ['1'],
          Tutorial: ['3'],
          Recitation: ['2'],
        },
        PC1222: {
          Lecture: ['1'],
          Tutorial: ['3'],
        },
      },
    },
    colors: {
      [1]: {
        CS3216: 1,
        CS1010S: 0,
        PC1222: 2,
      },
    },
    hidden: { [1]: ['PC1222'] },
    academicYear: expect.any(String),
    archive: {},
  });

  expect(state.settings).toMatchObject({
    mode: 'DARK',
  });

  expect(state.theme).toEqual({
    id: 'google',
    timetableOrientation: VERTICAL,
    showTitle: true,
  });
});
