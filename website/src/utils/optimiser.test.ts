import { CS1010S, CS3216, MA1521 } from '__mocks__/modules';
import { LessonOption, PinnedSlots, TimeRange } from 'types/optimiser';
import { Module, WorkingDays } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';
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
  getConflictingDays,
  getDaysForLessonType,
  getDisplayText,
  getFreeDayConflicts,
  getLessonOptions,
  getLessonTypes,
  getPinnedClashConflicts,
  getPinnedSlotsPayload,
  getPinnedSlotVenues,
  getRecordedLessonOptions,
  getLessonKey,
  getTimeRangeConflicts,
  getTimetableClassNos,
  isSaturdayInOptions,
  sortDays,
  getUnassignedLessonOptions,
  getOptimiserAcadYear,
  getTimeValues,
  getOptimiserTime,
} from './optimiser';
import { getModuleTimetable } from './modules';
import { serializeLessonDetails } from './timetables';

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
    const conflicts = getFreeDayConflicts(modules, 1, physicalLessonOptions, {}, selectedFreeDays);
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
    const conflicts = getFreeDayConflicts(modules, 1, physicalLessonOptions, {}, selectedFreeDays);
    expect(conflicts).toHaveLength(0);
  });

  // CS1010S Tutorial has classes on both Monday and Tuesday; class 1 is on Monday
  // 09:00-10:00 and class 10 is on Tuesday 09:00-10:00
  it('should report a conflict when the pinned class falls on a free day', () => {
    const pinnedClassNos: PinnedSlots = { 'CS1010S|Tutorial': '1' };
    const conflicts = getFreeDayConflicts(
      [CS1010S],
      1,
      [defaultTutorialOption],
      pinnedClassNos,
      new Set(['Monday']),
    );
    expect(conflicts).toEqual([
      {
        moduleCode: defaultTutorialOption.moduleCode,
        lessonType: defaultTutorialOption.lessonType,
        displayText: defaultTutorialOption.displayText,
        days: ['Monday'],
      },
    ]);
  });

  it('should report no conflict when the pinned class avoids the free days', () => {
    const pinnedClassNos: PinnedSlots = { 'CS1010S|Tutorial': '10' };
    const conflicts = getFreeDayConflicts(
      [CS1010S],
      1,
      [defaultTutorialOption],
      pinnedClassNos,
      new Set(['Monday']),
    );
    expect(conflicts).toHaveLength(0);
  });

  it('should skip pinned lessons that are not attended live', () => {
    const pinnedClassNos: PinnedSlots = { 'CS1010S|Tutorial': '1' };
    const conflicts = getFreeDayConflicts([CS1010S], 1, [], pinnedClassNos, new Set(['Monday']));
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

describe('getTimetableClassNos', () => {
  const getLessonId = (lessonType: string, classNo: string) => {
    const lesson = getModuleTimetable(CS1010S, 1).find(
      (l) => l.lessonType === lessonType && l.classNo === classNo,
    );
    if (!lesson) throw new Error(`expected CS1010S ${lessonType} ${classNo} in mock data`);
    return serializeLessonDetails(lesson);
  };

  it('should resolve a V2 lesson-id config to its classNo', () => {
    const timetable: SemTimetableConfig = {
      CS1010S: {
        Tutorial: [getLessonId('Tutorial', '2')],
        Lecture: [getLessonId('Lecture', '1')],
      },
    };
    expect(getTimetableClassNos(timetable, [CS1010S], 1)).toEqual({
      'CS1010S|Tutorial': '2',
      'CS1010S|Lecture': '1',
    });
  });

  it('should resolve a V1 classNo config directly', () => {
    const timetable: SemTimetableConfig = {
      CS1010S: { Tutorial: ['2'], Lecture: ['1'] },
    };
    expect(getTimetableClassNos(timetable, [CS1010S], 1)).toEqual({
      'CS1010S|Tutorial': '2',
      'CS1010S|Lecture': '1',
    });
  });

  it('should skip a V1 classNo that no longer exists', () => {
    const timetable: SemTimetableConfig = {
      CS1010S: { Tutorial: ['999'] },
    };
    expect(getTimetableClassNos(timetable, [CS1010S], 1)).toEqual({});
  });

  it('should skip lessons whose selection cannot be resolved', () => {
    const timetable: SemTimetableConfig = {
      CS1010S: { Laboratory: ['nonexistent-lesson-id'] },
    };
    expect(getTimetableClassNos(timetable, [CS1010S], 1)).toEqual({});
  });

  it('should skip modules that are not loaded', () => {
    const timetable: SemTimetableConfig = {
      CS9999: { Lecture: [getLessonId('Lecture', '1')] },
    };
    expect(getTimetableClassNos(timetable, [CS1010S], 1)).toEqual({});
  });
});

describe('getPinnedSlotVenues', () => {
  const lessonOptions = [defaultLectureOption, defaultTutorialOption];

  it("resolves the venue of each lesson's pinned classNo", () => {
    const timetableClassNos = {
      [defaultLectureOption.lessonKey]: '1',
      [defaultTutorialOption.lessonKey]: '2',
    };
    const expectedLectureVenue = getModuleTimetable(defaultModule, 1).find(
      (lesson) => lesson.lessonType === 'Lecture' && lesson.classNo === '1',
    )?.venue;
    const expectedTutorialVenue = getModuleTimetable(defaultModule, 1).find(
      (lesson) => lesson.lessonType === 'Tutorial' && lesson.classNo === '2',
    )?.venue;

    expect(getPinnedSlotVenues([defaultModule], 1, lessonOptions, timetableClassNos)).toEqual({
      [defaultLectureOption.lessonKey]: expectedLectureVenue,
      [defaultTutorialOption.lessonKey]: expectedTutorialVenue,
    });
  });

  it('skips lessons whose classNo is not resolved', () => {
    expect(getPinnedSlotVenues([defaultModule], 1, lessonOptions, {})).toEqual({});
  });
});

describe('getTimeRangeConflicts', () => {
  const defaultTimeRange: TimeRange = { earliest: '0800', latest: '1900' };
  // CS1010S Tutorial class 1 is on Monday 09:00-10:00, Recitation class 1 is on
  // Thursday 12:00-13:00
  const pinnedClassNos: PinnedSlots = { 'CS1010S|Tutorial': '1' };
  const physicalLessonOptions = [defaultTutorialOption];

  it('should report a pinned class starting before the earliest time', () => {
    const conflicts = getTimeRangeConflicts([CS1010S], 1, physicalLessonOptions, pinnedClassNos, {
      earliest: '1000',
      latest: '1900',
    });
    expect(conflicts).toEqual([
      {
        moduleCode: defaultTutorialOption.moduleCode,
        lessonType: defaultTutorialOption.lessonType,
        displayText: defaultTutorialOption.displayText,
        classNo: '1',
      },
    ]);
  });

  it('should report a pinned class ending after the latest time', () => {
    const conflicts = getTimeRangeConflicts(
      [CS1010S],
      1,
      [defaultRecitationOption],
      { 'CS1010S|Recitation': '1' },
      { earliest: '0800', latest: '1200' },
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].classNo).toEqual('1');
    expect(conflicts[0].lessonType).toEqual(defaultRecitationOption.lessonType);
  });

  it('should report no conflict when the pinned class is within the time range', () => {
    const conflicts = getTimeRangeConflicts(
      [CS1010S],
      1,
      physicalLessonOptions,
      pinnedClassNos,
      defaultTimeRange,
    );
    expect(conflicts).toHaveLength(0);
  });

  it('should skip unpinned lessons', () => {
    const conflicts = getTimeRangeConflicts(
      [CS1010S],
      1,
      physicalLessonOptions,
      {},
      { earliest: '1000', latest: '1900' },
    );
    expect(conflicts).toHaveLength(0);
  });

  it('should skip pinned lessons that are not attended live', () => {
    const conflicts = getTimeRangeConflicts([CS1010S], 1, [], pinnedClassNos, {
      earliest: '1000',
      latest: '1900',
    });
    expect(conflicts).toHaveLength(0);
  });
});

describe('getPinnedClashConflicts', () => {
  const ma1521LectureOption: LessonOption = {
    moduleCode: 'MA1521',
    lessonType: 'Lecture',
    colorIndex: 1,
    lessonKey: 'MA1521|Lecture',
    displayText: 'MA1521 Lecture',
    days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
  };
  const physicalLessonOptions = [defaultTutorialOption, ma1521LectureOption];

  it('should report two pinned classes that overlap', () => {
    // CS1010S Tutorial 2 is Monday 10:00-11:00; MA1521 Lecture 2 is Monday 10:00-12:00
    // and Thursday 10:00-12:00
    const conflicts = getPinnedClashConflicts([CS1010S, MA1521], 1, physicalLessonOptions, {
      'CS1010S|Tutorial': '2',
      'MA1521|Lecture': '2',
    });
    expect(conflicts).toEqual([
      {
        first: {
          moduleCode: defaultTutorialOption.moduleCode,
          lessonType: defaultTutorialOption.lessonType,
          displayText: defaultTutorialOption.displayText,
          classNo: '2',
        },
        second: {
          moduleCode: ma1521LectureOption.moduleCode,
          lessonType: ma1521LectureOption.lessonType,
          displayText: ma1521LectureOption.displayText,
          classNo: '2',
        },
      },
    ]);
  });

  it('should not report adjacent classes as a clash', () => {
    // CS1010S Tutorial 1 is Monday 09:00-10:00, ending exactly when MA1521 Lecture 2 starts
    const conflicts = getPinnedClashConflicts([CS1010S, MA1521], 1, physicalLessonOptions, {
      'CS1010S|Tutorial': '1',
      'MA1521|Lecture': '2',
    });
    expect(conflicts).toHaveLength(0);
  });

  it('should not report classes on different days', () => {
    // CS1010S Tutorial 1 is Monday 09:00-10:00; MA1521 Lecture 1 is Tuesday and
    // Friday 08:00-10:00
    const conflicts = getPinnedClashConflicts([CS1010S, MA1521], 1, physicalLessonOptions, {
      'CS1010S|Tutorial': '1',
      'MA1521|Lecture': '1',
    });
    expect(conflicts).toHaveLength(0);
  });

  it('should not report a single pinned lesson', () => {
    const conflicts = getPinnedClashConflicts([CS1010S, MA1521], 1, physicalLessonOptions, {
      'MA1521|Lecture': '2',
    });
    expect(conflicts).toHaveLength(0);
  });

  it('should skip pinned lessons that are not attended live', () => {
    // MA1521 Lecture is recorded (not in the physical lesson options), so its pin
    // cannot clash
    const conflicts = getPinnedClashConflicts([CS1010S, MA1521], 1, [defaultTutorialOption], {
      'CS1010S|Tutorial': '2',
      'MA1521|Lecture': '2',
    });
    expect(conflicts).toHaveLength(0);
  });

  it('should report no clashes when nothing is pinned', () => {
    const conflicts = getPinnedClashConflicts([CS1010S, MA1521], 1, physicalLessonOptions, {});
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
