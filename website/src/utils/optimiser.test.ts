import { CS1010S, CS3216, MA1521 } from '__mocks__/modules';
import { LessonOption } from 'types/optimiser';
import { Module, WorkingDays } from 'types/modules';
import { shuffle } from 'lodash';
import {
  getConflictingDays,
  getDaysForLessonType,
  getDisplayText,
  getFreeDayConflicts,
  getLessonOptions,
  getLessonTypes,
  getRecordedLessonOptions,
  getUniqueKey,
  isSaturdayInOptions,
  sortDays,
} from './optimiser';
import { getModuleTimetable } from './modules';

const defaultModule = CS1010S;
const defaultLectureOption = {
  moduleCode: 'CS1010S',
  lessonType: 'Lecture',
  colorIndex: 0,
  uniqueKey: 'CS1010S-Lecture',
  displayText: 'CS1010S Lecture',
  days: ['Wednesday'],
};
const defaultRecitationOption = {
  moduleCode: 'CS1010S',
  lessonType: 'Recitation',
  colorIndex: 0,
  uniqueKey: 'CS1010S-Recitation',
  displayText: 'CS1010S Recitation',
  days: ['Thursday', 'Friday'],
};
const defaultTutorialOption = {
  moduleCode: 'CS1010S',
  lessonType: 'Tutorial',
  colorIndex: 0,
  uniqueKey: 'CS1010S-Tutorial',
  displayText: 'CS1010S Tutorial',
  days: ['Monday', 'Tuesday'],
};

describe('getUniqueKey', () => {
  it('should format unique key', () => {
    expect(getUniqueKey('CS1010S', 'Lecture')).toEqual('CS1010S-Lecture');
  });
});

describe('getDisplayText', () => {
  it('should format display text', () => {
    expect(getDisplayText('CS1010S', 'Lecture')).toEqual('CS1010S Lecture');
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
        uniqueKey: 'CS3216-Lecture',
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
  it('should filter out physical lessons', () => {
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
        uniqueKey: 'MA1521-Lecture',
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
        uniqueKey: 'MA1521-Lecture',
        displayText: 'MA1521 Lecture',
        days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      },
    ];
    const selectedFreeDays = new Set(['Monday', 'Thursday']);
    const conflicts = getFreeDayConflicts(modules, 1, physicalLessonOptions, selectedFreeDays);
    expect(conflicts).toHaveLength(0);
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
        uniqueKey: 'UTC3103-Seminar-Style Module Class',
        displayText: 'UTC3103 Seminar-Style Module Class',
        days: ['Saturday'],
      },
    ];
    expect(isSaturdayInOptions(lessonOptions)).toBe(true);
  });
});
