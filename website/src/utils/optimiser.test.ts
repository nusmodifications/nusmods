import { CS1010S, CS3216, MA1521 } from '__mocks__/modules';
import { LessonOption, TimeRange } from 'types/optimiser';
import { Module, WorkingDays } from 'types/modules';
import { shuffle } from 'lodash';
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
