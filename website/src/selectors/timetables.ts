import { createSelector } from 'reselect';

import type { ModuleCode, Semester } from 'types/modules';
import type { TimetableSlot, TimetableSlotData } from 'types/reducers';
import type { State } from 'types/state';

import { fetchArchiveRequest } from 'actions/constants';
import config from 'config';
import { DEFAULT_SLOT_ID, DEFAULT_SLOT_TITLE } from 'reducers/timetables';
import { isOngoing, isSuccess } from 'selectors/requests';

export function isArchiveLoading(state: State, moduleCode: ModuleCode) {
  return config.archiveYears.some((year) =>
    isOngoing(state, fetchArchiveRequest(moduleCode, year)),
  );
}

export function availableArchive(state: State, moduleCode: ModuleCode): string[] {
  return config.archiveYears.filter((year) =>
    isSuccess(state, fetchArchiveRequest(moduleCode, year)),
  );
}

const EMPTY_OBJECT = {};

/**
 * Extract semester timetable lessons for a specific semester.
 */
export const getSemesterTimetableLessons = createSelector(
  ({ timetables }: State) => timetables.lessons,
  (lessons) => (semester: Semester | null) =>
    semester === null ? EMPTY_OBJECT : (lessons[semester] ?? EMPTY_OBJECT),
);

/**
 * Extract semester timetable colors for a specific semester.
 */
export const getSemesterTimetableColors = createSelector(
  ({ timetables }: State) => timetables.colors,
  (colors) => (semester: Semester | null) =>
    semester === null ? EMPTY_OBJECT : (colors[semester] ?? EMPTY_OBJECT),
);

/**
 * Extract hidden courses for a specific semester.
 */
export const getSemesterTimetableHidden = createSelector(
  ({ timetables }: State) => timetables.hidden,
  (hidden) => (semester: Semester | null) => (semester === null ? [] : (hidden[semester] ?? [])),
);

/**
 * Extract TA-ed lessons for a specific semester.
 */
export const getSemesterTimetableTaLessons = createSelector(
  ({ timetables }: State) => timetables.ta,
  (ta) => (semester: Semester | null) =>
    semester === null ? EMPTY_OBJECT : (ta[semester] ?? EMPTY_OBJECT),
);

const EMPTY_SLOT_DATA: TimetableSlotData = { lessons: {}, colors: {}, hidden: [], ta: [] };

// Semesters that have never used slots have a single implicit slot. Its
// `data` is empty because the implicit slot is always active, and an active
// slot's timetable lives in the live maps - read it via getSlotTimetableData.
const IMPLICIT_SLOTS: TimetableSlot[] = [
  { id: DEFAULT_SLOT_ID, title: DEFAULT_SLOT_TITLE, data: EMPTY_SLOT_DATA },
];

/**
 * Extract the saved timetable slots for a specific semester.
 */
export const getTimetableSlots = createSelector(
  ({ timetables }: State) => timetables.slots,
  (slots) =>
    (semester: Semester): TimetableSlot[] => {
      const semesterSlots = slots[semester];
      return semesterSlots && semesterSlots.length > 0 ? semesterSlots : IMPLICIT_SLOTS;
    },
);

/**
 * Extract the active slot id for a specific semester.
 */
export const getActiveSlotId = createSelector(
  ({ timetables }: State) => timetables.activeSlot,
  (activeSlot) =>
    (semester: Semester): string =>
      activeSlot[semester] ?? DEFAULT_SLOT_ID,
);

/**
 * Extract a slot's timetable data. This is the single source of truth for
 * reading slot data: the active slot's data is composed from the live
 * timetable maps, while inactive slots return their stored snapshot.
 */
export const getSlotTimetableData = createSelector(
  ({ timetables }: State) => timetables,
  (timetables) =>
    (semester: Semester, slotId: string): TimetableSlotData => {
      const activeId = timetables.activeSlot[semester] ?? DEFAULT_SLOT_ID;
      if (slotId === activeId) {
        return {
          lessons: timetables.lessons[semester] ?? EMPTY_OBJECT,
          colors: timetables.colors[semester] ?? EMPTY_OBJECT,
          hidden: timetables.hidden[semester] ?? EMPTY_SLOT_DATA.hidden,
          ta: timetables.ta[semester] ?? EMPTY_SLOT_DATA.ta,
        };
      }

      const slot = timetables.slots[semester]?.find((s) => s.id === slotId);
      return slot ? slot.data : EMPTY_SLOT_DATA;
    },
);
