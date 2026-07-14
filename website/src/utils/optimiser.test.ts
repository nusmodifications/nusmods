import { CS1010S, CS3216, MA1521 } from '__mocks__/modules';
import { LessonOption, PinnedSlots, TimeRange } from 'types/optimiser';
import { Module, WorkingDays } from 'types/modules';
import { shuffle } from 'lodash-es';
import { OptimiseResponse } from 'apis/optimiser';
import {
  defaultLectureOption,
  defaultLectureSlot,
  defaultRecitationOption,
  defaultRecitationSlot,
  defaultTutorialOption,
  defaultTutorialSlot,
} from 'test-utils/optimiser';
import {
  getAllPinnedSlotOptions,
  getConflictingDays,
  getDaysForLessonType,
  getDisplayText,
  getFreeDayConflicts,
  getLessonOptions,
  getLessonTypes,
  getPinnedSlotConflicts,
  getPinnedSlotOptions,
  getPinnedSlotsPayload,
  getRecordedLessonOptions,
  getLessonKey,
  isSaturdayInOptions,
  sortDays,
  getUnassignedLessonOptions,
  getOptimiserAcadYear,
  getTimeValues,
  getOptimiserTime,
} from './optimiser';
import { getModuleTimetable } from './modules';

const defaultModule = CS1010S;

describe('getLessonKey', () => {
  it('should format unique key', () => {
    expect(getLessonKey('CS1010S', 'Lecture')).toEqual('CS1010S|Lecture');
  });
});

describe('getDisplayText', () => {
  it('getDisplayText should format display text', () => {
    expect(getDisplayText('CS1010S', 'Lecture')).toEqual('CS1010S Lecture');
  });
});

describe('getOptimiserAcadYear', () => {
  it('getOptimiserAcadYear should format academic year', () => {
    expect(getOptimiserAcadYear('2024/2025')).toEqual('2024-2025');
  });
});

describe('getOptimiserTime', () => {
  it('getOptimiserTime should format time', () => {
    expect(getOptimiserTime('0800')).toEqual('08:00');
    expect(getOptimiserTime('1000')).toEqual('10:00');
    expect(getOptimiserTime('1030')).toEqual('10:30');
  });
});

describe('getLessonTypes', () => {
  it('should map lessons to unique lesson types', () => {
    const lessons = getModuleTimetable(defaultModule, 1);
    const lessonTypes = getLessonTypes(lessons);
    expect(lessonTypes).toHaveLength(3);
    expect(lessonTypes).toContain(defaultLectureOption.lessonType);
    expect(lessonTypes).toContain(defaultRecitationOption.lessonType);
    expect(lessonTypes).toContain(defaultTutorialOption.lessonType);
  });
});

describe('getDaysForLessonType', () => {
  it('should get unique days for the lesson type', () => {
    const lessons = getModuleTimetable(defaultModule, 1);
    const lessonOptions = [defaultLectureOption, defaultRecitationOption, defaultTutorialOption];
    lessonOptions.forEach((lessonOption) => {
      const days = getDaysForLessonType(lessons, lessonOption.lessonType);
      expect(days).toEqual(lessonOption.days);
    });
  });
});

describe('getLessonOptions', () => {
  it('should map modules to lesson options', () => {
    const modules = [defaultModule, CS3216];
    const colors = { [defaultModule.moduleCode]: 0, CS3216: 1 };
    const expected: LessonOption[] = [
      defaultLectureOption,
      defaultRecitationOption,
      defaultTutorialOption,
      {
        moduleCode: 'CS3216',
        lessonType: 'Lecture',
        colorIndex: 1,
        lessonKey: 'CS3216|Lecture',
        displayText: 'CS3216 Lecture',
        days: ['Monday'],
      },
    ];
    expect(getLessonOptions(modules, 1, colors)).toEqual(expected);
  });

  it('should return no options if the module is not offered', () => {
    const modules = [CS3216];
    const colors = { CS3216: 0 };
    expect(getLessonOptions(modules, 2, colors)).toHaveLength(0);
  });
});

describe('getRecordedLessonOptions', () => {
  it('should filter out physical lesson options', () => {
    const lessonOptions: LessonOption[] = [
      defaultLectureOption,
      defaultRecitationOption,
      defaultTutorialOption,
    ];
    const physicalLessonOptions: LessonOption[] = [defaultTutorialOption];
    const recordedLessonOptions = getRecordedLessonOptions(lessonOptions, physicalLessonOptions);
    expect(recordedLessonOptions).toContain(defaultLectureOption);
    expect(recordedLessonOptions).toContain(defaultRecitationOption);
  });
});

describe('getConflictingDays', () => {
  it('should return conflicting days', () => {
    const lessons = getModuleTimetable(MA1521, 1).filter(
      (lesson) => lesson.lessonType === 'Lecture',
    );
    const selectedFreeDays = new Set(['Monday', 'Tuesday']);
    const conflictingDays = getConflictingDays(lessons, selectedFreeDays);
    expect(conflictingDays).toHaveLength(2);
    expect(conflictingDays).toContain('Monday');
    expect(conflictingDays).toContain('Tuesday');
  });

  it('should return no conflicts if another class can be taken', () => {
    const lessons = getModuleTimetable(MA1521, 1).filter(
      (lesson) => lesson.lessonType === 'Lecture',
    );
    const selectedFreeDays = new Set(['Monday', 'Thursday']);
    expect(getConflictingDays(lessons, selectedFreeDays)).toHaveLength(0);
  });
});

describe('sortDays', () => {
  it('should sort days in order', () => {
    const days = shuffle([...WorkingDays]);
    expect(sortDays(days)).toEqual(WorkingDays);
  });
});

describe('getFreeDayConflicts', () => {
  it('should return all free day conflicts', () => {
    const modules: Module[] = [defaultModule, MA1521];
    const physicalLessonOptions: LessonOption[] = [
      defaultLectureOption,
      defaultRecitationOption,
      defaultTutorialOption,
      {
        moduleCode: 'MA1521',
        lessonType: 'Lecture',
        colorIndex: 1,
        lessonKey: 'MA1521|Lecture',
        displayText: 'MA1521 Lecture',
        days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      },
    ];
    const selectedFreeDays = new Set(['Monday', 'Tuesday', 'Thursday']);
    const expected = [
      {
        moduleCode: defaultTutorialOption.moduleCode,
        lessonType: defaultTutorialOption.lessonType,
        displayText: defaultTutorialOption.displayText,
        days: ['Monday', 'Tuesday'],
      },
      {
        moduleCode: 'MA1521',
        lessonType: 'Lecture',
        displayText: 'MA1521 Lecture',
        days: ['Monday', 'Tuesday', 'Thursday'],
      },
    ];
    const conflicts = getFreeDayConflicts(modules, 1, physicalLessonOptions, selectedFreeDays);
    expect(conflicts).toEqual(expected);
  });

  it('should return no conflicts if another class can be taken', () => {
    const modules: Module[] = [defaultModule, MA1521];
    const physicalLessonOptions: LessonOption[] = [
      defaultLectureOption,
      defaultRecitationOption,
      defaultTutorialOption,
      {
        moduleCode: 'MA1521',
        lessonType: 'Lecture',
        colorIndex: 1,
        lessonKey: 'MA1521|Lecture',
        displayText: 'MA1521 Lecture',
        days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      },
    ];
    const selectedFreeDays = new Set(['Monday', 'Thursday']);
    const conflicts = getFreeDayConflicts(modules, 1, physicalLessonOptions, selectedFreeDays);
    expect(conflicts).toHaveLength(0);
  });
});

describe('getUnassignedLessOptions', () => {
  it('should return unassigned lesson options', () => {
    const lessonOptions: LessonOption[] = [
      defaultLectureOption,
      defaultRecitationOption,
      defaultTutorialOption,
    ];
    const optimiseResponse: OptimiseResponse = {
      DaySlots: [[], [], [defaultLectureSlot], [], [defaultRecitationSlot]],
    };
    const unassignedLessonOptions = getUnassignedLessonOptions(lessonOptions, optimiseResponse);
    expect(unassignedLessonOptions).toHaveLength(1);
    expect(unassignedLessonOptions).toContain(defaultTutorialOption);
  });

  it('should return empty array if all lesson options are assigned', () => {
    const lessonOptions: LessonOption[] = [
      defaultLectureOption,
      defaultRecitationOption,
      defaultTutorialOption,
    ];
    const optimiseResponse: OptimiseResponse = {
      DaySlots: [[defaultTutorialSlot], [], [defaultLectureSlot], [], [defaultRecitationSlot]],
    };
    const unassignedLessonOptions = getUnassignedLessonOptions(lessonOptions, optimiseResponse);
    expect(unassignedLessonOptions).toHaveLength(0);
  });
});

describe('isSaturdayInOptions', () => {
  it('should return false if there are no saturday classes', () => {
    const lessonOptions: LessonOption[] = [
      defaultLectureOption,
      defaultRecitationOption,
      defaultTutorialOption,
    ];
    expect(isSaturdayInOptions(lessonOptions)).toBe(false);
  });

  it('should return true if a saturday class is possible', () => {
    const lessonOptions: LessonOption[] = [
      defaultLectureOption,
      defaultRecitationOption,
      defaultTutorialOption,
      {
        moduleCode: 'UTC3103',
        lessonType: 'Seminar-Style Module Class',
        colorIndex: 1,
        lessonKey: 'UTC3103|Seminar-Style Module Class',
        displayText: 'UTC3103 Seminar-Style Module Class',
        days: ['Saturday'],
      },
    ];
    expect(isSaturdayInOptions(lessonOptions)).toBe(true);
  });
});

describe('getPinnedSlotOptions', () => {
  it('should combine paired slots of the same class into one option, sorted by day', () => {
    const lessons = getModuleTimetable(MA1521, 1);
    const options = getPinnedSlotOptions(lessons, 'Lecture');
    expect(options).toEqual([
      { classNo: '1', label: '1 — Tue 08:00-10:00, Fri 08:00-10:00' },
      { classNo: '2', label: '2 — Mon 10:00-12:00, Thu 10:00-12:00' },
    ]);
  });

  it('should return one option per class number in natural sort order', () => {
    const lessons = getModuleTimetable(CS1010S, 1);
    const options = getPinnedSlotOptions(lessons, 'Tutorial');
    expect(options).toHaveLength(33);
    expect(options[0]).toEqual({ classNo: '1', label: '1 — Mon 09:00-10:00' });
    expect(options[1].classNo).toEqual('2');
  });
});

describe('getAllPinnedSlotOptions', () => {
  it('should key options by lessonKey for every lesson type', () => {
    const allOptions = getAllPinnedSlotOptions([CS1010S], 1);
    expect(Object.keys(allOptions).sort()).toEqual([
      'CS1010S|Lecture',
      'CS1010S|Recitation',
      'CS1010S|Tutorial',
    ]);
    expect(allOptions['CS1010S|Lecture']).toHaveLength(1);
  });

  it('should return no options if the module is not offered', () => {
    expect(getAllPinnedSlotOptions([CS3216], 2)).toEqual({});
  });
});

describe('getPinnedSlotConflicts', () => {
  const defaultTimeRange: TimeRange = { earliest: '0800', latest: '1900' };
  // CS1010S Tutorial class 1 is on Monday 09:00-10:00
  const pinnedSlots: PinnedSlots = { 'CS1010S|Tutorial': '1' };
  const liveLessonKeys = new Set(['CS1010S|Tutorial']);

  it('should report a pinned class on a selected free day', () => {
    const conflicts = getPinnedSlotConflicts(
      [CS1010S],
      1,
      pinnedSlots,
      liveLessonKeys,
      new Set(['Monday']),
      defaultTimeRange,
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].displayText).toEqual('CS1010S Tutorial');
    expect(conflicts[0].classNo).toEqual('1');
    expect(conflicts[0].reasons).toHaveLength(1);
    expect(conflicts[0].reasons[0]).toContain('Monday');
  });

  it('should report a pinned class outside the selected lesson times', () => {
    const conflicts = getPinnedSlotConflicts([CS1010S], 1, pinnedSlots, liveLessonKeys, new Set(), {
      earliest: '1000',
      latest: '1900',
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].reasons).toHaveLength(1);
    expect(conflicts[0].reasons[0]).toContain('outside your selected lesson times');
  });

  it('should skip pinned lessons that are not attended live', () => {
    const conflicts = getPinnedSlotConflicts(
      [CS1010S],
      1,
      pinnedSlots,
      new Set(),
      new Set(['Monday']),
      defaultTimeRange,
    );
    expect(conflicts).toHaveLength(0);
  });

  it('should return no conflicts when the pinned class fits all preferences', () => {
    const conflicts = getPinnedSlotConflicts(
      [CS1010S],
      1,
      pinnedSlots,
      liveLessonKeys,
      new Set(['Friday']),
      defaultTimeRange,
    );
    expect(conflicts).toHaveLength(0);
  });
});

describe('getPinnedSlotsPayload', () => {
  it('should serialise pins into MODULE|LessonType|ClassNo entries', () => {
    const pinnedSlots: PinnedSlots = { 'CS1010S|Tutorial': '08', 'MA1521|Lecture': '1' };
    expect(getPinnedSlotsPayload(pinnedSlots).sort()).toEqual([
      'CS1010S|Tutorial|08',
      'MA1521|Lecture|1',
    ]);
  });

  it('should return an empty array when nothing is pinned', () => {
    expect(getPinnedSlotsPayload({})).toEqual([]);
  });
});

describe('getTimeValues', () => {
  it('should return a range of times', () => {
    const timeRange: TimeRange = {
      earliest: '0800',
      latest: '1030',
    };
    const expected = ['0800', '0830', '0900', '0930', '1000', '1030'];
    expect(getTimeValues(timeRange)).toEqual(expected);
  });
});
