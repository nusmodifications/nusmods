import { defaultTimetableState } from 'reducers/timetables';
import { TimetablesState } from 'types/reducers';
import { State } from 'types/state';

import { getActiveSlotId, getSlotTimetableData, getTimetableSlots } from './timetables';

vi.mock('config');

const makeState = (timetables: TimetablesState) => ({ timetables }) as State;

const sem1Lessons = {
  CS1010S: {
    Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
  },
};

const liveState = makeState({
  ...defaultTimetableState,
  lessons: { [1]: sem1Lessons },
  colors: { [1]: { CS1010S: 0 } },
  hidden: { [1]: ['CS1010S'] },
});

const slotZero = {
  id: '0',
  title: 'Plan A',
  data: { lessons: sem1Lessons, colors: { CS1010S: 0 }, hidden: ['CS1010S'], ta: [] },
};
const slotOne = {
  id: '1',
  title: 'Plan B',
  data: { lessons: {}, colors: {}, hidden: [], ta: [] },
};

const materializedState = makeState({
  ...defaultTimetableState,
  lessons: { [1]: sem1Lessons },
  colors: { [1]: { CS1010S: 0 } },
  hidden: { [1]: ['CS1010S'] },
  slots: { [1]: [slotZero, slotOne] },
  activeSlot: { [1]: '0' },
});

describe(getTimetableSlots, () => {
  test('should return the implicit default slot for semesters without slots', () => {
    const slots = getTimetableSlots(liveState)(1);

    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({ id: '0', title: 'Timetable 1' });
  });

  test('should return a stable reference for the implicit slot', () => {
    const getSlots = getTimetableSlots(liveState);
    expect(getSlots(1)).toBe(getSlots(1));
  });

  test('should return materialized slots directly', () => {
    expect(getTimetableSlots(materializedState)(1)).toBe(materializedState.timetables.slots[1]);
  });
});

describe(getActiveSlotId, () => {
  test('should default to the implicit slot id', () => {
    expect(getActiveSlotId(liveState)(1)).toBe('0');
  });

  test('should return the recorded active slot', () => {
    const state = makeState({
      ...materializedState.timetables,
      activeSlot: { [1]: '1' },
    });
    expect(getActiveSlotId(state)(1)).toBe('1');
  });
});

describe(getSlotTimetableData, () => {
  test('should compose the active slot data from the live timetable', () => {
    expect(getSlotTimetableData(materializedState)(1, '0')).toEqual({
      lessons: sem1Lessons,
      colors: { CS1010S: 0 },
      hidden: ['CS1010S'],
      ta: [],
    });
  });

  test('should compose live data for the implicit active slot', () => {
    expect(getSlotTimetableData(liveState)(1, '0')).toEqual({
      lessons: sem1Lessons,
      colors: { CS1010S: 0 },
      hidden: ['CS1010S'],
      ta: [],
    });
  });

  test('should return the stored snapshot for inactive slots', () => {
    expect(getSlotTimetableData(materializedState)(1, '1')).toBe(slotOne.data);
  });

  test('should return empty data for unknown slots', () => {
    expect(getSlotTimetableData(materializedState)(1, '99')).toEqual({
      lessons: {},
      colors: {},
      hidden: [],
      ta: [],
    });
  });
});
