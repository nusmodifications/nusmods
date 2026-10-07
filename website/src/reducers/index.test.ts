import { ExportData } from 'types/export';
import { VERTICAL } from 'types/reducers';
import reducers from 'reducers';
import { setExportedData } from 'actions/export';
import { addTimetableSlot, Internal } from 'actions/timetables';
import { undo } from 'actions/undoHistory';
import modules from '__mocks__/modules/index';
import { DARK_COLOR_SCHEME, DARK_COLOR_SCHEME_PREFERENCE } from 'types/settings';
import { SemTimetableConfig, TimetableConfig } from 'types/timetables';

/* eslint-disable no-useless-computed-key */

const exportData: ExportData = {
  semester: 1,
  timetable: {
    CS3216: {
      Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
    },
    CS1010S: {
      Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      Tutorial: ['1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13'],
      Recitation: ['1|THU|1200|1300|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
    },
    PC1222: {
      Lecture: ['SL1|TUE|1000|1200|LT31|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      Tutorial: ['ST1|MON|1700|1800|S12-0401|1_2_3_4_5_6_7_8_9_10_11_12_13'],
    },
  } satisfies SemTimetableConfig,
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

vi.mock('storage/persistReducer', () => ({
  default: <T>(_key: string, reducer: T) => reducer,
}));

test('reducers should set export data state', () => {
  const state = reducers({} as any, setExportedData(modules, exportData));

  expect(state.timetables).toEqual({
    lessons: {
      [1]: {
        CS3216: {
          Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        },
        CS1010S: {
          Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          Tutorial: ['1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13'],
          Recitation: ['1|THU|1200|1300|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        },
        PC1222: {
          Lecture: ['SL1|TUE|1000|1200|LT31|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          Tutorial: ['ST1|MON|1700|1800|S12-0401|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        },
      },
    } satisfies TimetableConfig,
    colors: {
      [1]: {
        CS3216: 1,
        CS1010S: 0,
        PC1222: 2,
      },
    },
    hidden: { [1]: ['PC1222'] },
    ta: { [1]: ['CS1010S'] },
    slots: {},
    activeSlot: {},
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

test('undo should restore a deleted timetable slot', () => {
  let state = reducers({} as any, { type: 'INIT', payload: null } as any);
  state = reducers(state, addTimetableSlot(1, { duplicateCurrent: true }));
  const beforeDelete = state;
  expect(state.timetables.slots[1]).toHaveLength(2);

  state = reducers(state, Internal.deleteTimetableSlot(1, '0'));
  expect(state.timetables.slots[1]).toHaveLength(1);

  state = reducers(state, undo());
  expect(state.timetables.slots[1]).toEqual(beforeDelete.timetables.slots[1]);
  expect(state.timetables.activeSlot[1]).toBe(beforeDelete.timetables.activeSlot[1]);
});
