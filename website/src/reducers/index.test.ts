import { ExportData } from 'types/export';
import { VERTICAL } from 'types/reducers';
import reducers from 'reducers';
import { setExportedData } from 'actions/export';
import modules from '__mocks__/modules/index';
import { DARK_COLOR_SCHEME, DARK_COLOR_SCHEME_PREFERENCE } from 'types/settings';

/* eslint-disable no-useless-computed-key */

const exportData: ExportData = {
  semester: 1,
  timetable: {
    CS3216: {
      Lecture: '1',
    },
    CS1010S: {
      Lecture: '1',
      Tutorial: '3',
      Recitation: '2',
    },
    PC1222: {
      Lecture: '1',
      Tutorial: '3',
    },
  },
  colors: {
    CS3216: 1,
    CS1010S: 0,
    PC1222: 2,
  },
  hidden: ['PC1222'],
  ta: ['CS1010S'],
  theme: {
    id: 'google',
    timetableOrientation: VERTICAL,
    showTitle: true,
  },
  settings: {
    colorScheme: DARK_COLOR_SCHEME,
  },
};

jest.mock(
  'storage/persistReducer',
  <T>() =>
    (_key: string, reducer: T) =>
      reducer,
);

test('reducers should set export data state', () => {
  const state = reducers({} as any, setExportedData(modules, exportData));

  expect(state.timetables).toEqual({
    lessons: {
      [1]: {
        CS3216: {
          Lecture: '1',
        },
        CS1010S: {
          Lecture: '1',
          Tutorial: '3',
          Recitation: '2',
        },
        PC1222: {
          Lecture: '1',
          Tutorial: '3',
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
    ta: { [1]: ['CS1010S'] },
    academicYear: expect.any(String),
    archive: {},
  });

  expect(state.settings).toMatchObject({
    colorScheme: DARK_COLOR_SCHEME_PREFERENCE,
  });

  expect(state.theme).toEqual({
    id: 'google',
    timetableOrientation: VERTICAL,
    showTitle: true,
  });
});
