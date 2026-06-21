import { describe, expect, it, vi } from 'vitest';

import type { Module } from 'types/modules';

import CS1010S from '__mocks__/modules/CS1010S.json';
import {
  getEffectiveSpecialTermAcadYear,
  getPreviousAyShortName,
  isPreviousAySpecialTermActive,
  isUsingPreviousAySpecialTermData,
  mergePreviousAySpecialTermData,
  shouldShowSt2ExamExternalLink,
} from 'utils/specialTerm';

vi.mock('config', () => ({
  default: {
    academicYear: '2025/2026',
    specialTermAcademicYear: null,
    showSt2ExamTimetable: true,
  },
}));

describe(isPreviousAySpecialTermActive, () => {
  it('returns true during previous AY Special Term I after AY migration', () => {
    expect(isPreviousAySpecialTermActive('2025/2026', new Date(2025, 4, 15))).toBe(true);
    expect(isPreviousAySpecialTermActive('2025/2026', new Date(2025, 4, 12))).toBe(true);
  });

  it('returns true during previous AY Special Term II after AY migration', () => {
    expect(isPreviousAySpecialTermActive('2025/2026', new Date(2025, 6, 1))).toBe(true);
    expect(isPreviousAySpecialTermActive('2025/2026', new Date(2025, 7, 10))).toBe(true);
  });

  it('returns false before previous AY Special Term I starts', () => {
    expect(isPreviousAySpecialTermActive('2025/2026', new Date(2025, 4, 1))).toBe(false);
    expect(isPreviousAySpecialTermActive('2025/2026', new Date(2025, 4, 11))).toBe(false);
  });

  it('returns false after new AY semester 1 starts', () => {
    expect(isPreviousAySpecialTermActive('2025/2026', new Date(2025, 7, 11))).toBe(false);
    expect(isPreviousAySpecialTermActive('2025/2026', new Date(2026, 0, 1))).toBe(false);
  });
});

describe(getEffectiveSpecialTermAcadYear, () => {
  it('auto-detects previous AY during overlap', () => {
    expect(getEffectiveSpecialTermAcadYear('2025/2026', null, new Date(2025, 4, 15))).toBe(
      '2024/2025',
    );
    expect(getEffectiveSpecialTermAcadYear('2025/2026', null, new Date(2025, 6, 1))).toBe(
      '2024/2025',
    );
    expect(getEffectiveSpecialTermAcadYear('2025/2026', null, new Date(2025, 7, 10))).toBe(
      '2024/2025',
    );
  });

  it('uses current AY outside overlap', () => {
    expect(getEffectiveSpecialTermAcadYear('2025/2026', null, new Date(2025, 7, 11))).toBe(
      '2025/2026',
    );
    expect(getEffectiveSpecialTermAcadYear('2025/2026', null, new Date(2025, 8, 1))).toBe(
      '2025/2026',
    );
  });

  it('uses manual override when configured', () => {
    expect(getEffectiveSpecialTermAcadYear('2025/2026', '2023/2024', new Date(2025, 6, 1))).toBe(
      '2023/2024',
    );
  });
});

describe(isUsingPreviousAySpecialTermData, () => {
  it('returns true only during overlap', () => {
    expect(isUsingPreviousAySpecialTermData('2025/2026', null, new Date(2025, 4, 15))).toBe(true);
    expect(isUsingPreviousAySpecialTermData('2025/2026', null, new Date(2025, 6, 1))).toBe(true);
    expect(isUsingPreviousAySpecialTermData('2025/2026', null, new Date(2025, 8, 1))).toBe(false);
  });
});

describe(getPreviousAyShortName, () => {
  it('returns short name for effective special term AY', () => {
    expect(getPreviousAyShortName('2025/2026', null, new Date(2025, 4, 15))).toBe('24/25');
  });
});

describe(mergePreviousAySpecialTermData, () => {
  const st1SemesterData = {
    semester: 3 as const,
    timetable: [
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: [1, 2, 3, 4, 5, 6],
        day: 'Monday' as const,
        startTime: '1000',
        endTime: '1200',
        venue: 'LT19',
        lessonIndex: 0,
      },
    ],
    examDate: '2025-06-10T09:00:00.000+08:00',
    examDuration: 120,
  };

  const st2SemesterData = {
    semester: 4 as const,
    timetable: [
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: [1, 2, 3, 4, 5, 6],
        day: 'Monday' as const,
        startTime: '1000',
        endTime: '1200',
        venue: 'LT19',
        lessonIndex: 0,
      },
    ],
    examDate: '2025-07-28T09:00:00.000+08:00',
    examDuration: 120,
  };

  it('merges ST I and ST II data from archive when current module lacks them', () => {
    const currentModule = {
      ...CS1010S,
      semesterData: CS1010S.semesterData.filter(
        (semester) => semester.semester !== 3 && semester.semester !== 4,
      ),
    } as unknown as Module;
    const archiveModule = {
      ...CS1010S,
      semesterData: [st1SemesterData, st2SemesterData],
    } as unknown as Module;

    const merged = mergePreviousAySpecialTermData(currentModule, archiveModule);
    expect(merged.semesterData.find((semester) => semester.semester === 3)).toEqual(
      st1SemesterData,
    );
    expect(merged.semesterData.find((semester) => semester.semester === 4)).toEqual(
      st2SemesterData,
    );
  });

  it('returns current module unchanged when archive has no special term data', () => {
    const currentModule = CS1010S as unknown as Module;
    const archiveModule = {
      ...CS1010S,
      semesterData: CS1010S.semesterData.filter(
        (semester) => semester.semester !== 3 && semester.semester !== 4,
      ),
    } as unknown as Module;

    expect(mergePreviousAySpecialTermData(currentModule, archiveModule)).toBe(currentModule);
  });
});

describe(shouldShowSt2ExamExternalLink, () => {
  it('shows external link during overlap when ST II exam date is missing', () => {
    const module = {
      semesterData: [{ semester: 4 as const, timetable: [] }],
    };

    expect(shouldShowSt2ExamExternalLink(module, new Date(2025, 6, 1))).toBe(true);
  });

  it('hides external link when merged ST II exam date is available', () => {
    const module = {
      semesterData: [
        {
          semester: 4 as const,
          timetable: [],
          examDate: '2025-07-28T09:00:00.000+08:00',
        },
      ],
    };

    expect(shouldShowSt2ExamExternalLink(module, new Date(2025, 6, 1))).toBe(false);
  });

  it('hides external link outside overlap', () => {
    const module = {
      semesterData: [{ semester: 4 as const, timetable: [] }],
    };

    expect(shouldShowSt2ExamExternalLink(module, new Date(2025, 8, 1))).toBe(false);
  });
});
