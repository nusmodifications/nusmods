import { describe, expect, it, vi } from 'vitest';

import type { Module } from 'types/modules';

import CS1010S from '__mocks__/modules/CS1010S.json';
import {
  getEffectiveSt2AcadYear,
  getPreviousAyShortName,
  isPreviousAySt2Active,
  isUsingPreviousAySt2Data,
  mergePreviousAySt2Data,
  shouldShowSt2ExamExternalLink,
} from 'utils/specialTerm';

vi.mock('config', () => ({
  default: {
    academicYear: '2025/2026',
    specialTermAcademicYear: null,
    showSt2ExamTimetable: true,
  },
}));

describe(isPreviousAySt2Active, () => {
  it('returns true during the ST II overlap after AY migration', () => {
    expect(isPreviousAySt2Active('2025/2026', new Date(2025, 6, 1))).toBe(true);
  });

  it('returns false before previous AY ST II starts', () => {
    expect(isPreviousAySt2Active('2025/2026', new Date(2025, 5, 1))).toBe(false);
  });

  it('returns false after new AY semester 1 starts', () => {
    expect(isPreviousAySt2Active('2025/2026', new Date(2025, 7, 11))).toBe(false);
  });
});

describe(getEffectiveSt2AcadYear, () => {
  it('auto-detects previous AY during overlap', () => {
    expect(getEffectiveSt2AcadYear('2025/2026', null, new Date(2025, 6, 1))).toBe('2024/2025');
  });

  it('uses manual override when configured', () => {
    expect(getEffectiveSt2AcadYear('2025/2026', '2023/2024', new Date(2025, 6, 1))).toBe(
      '2023/2024',
    );
  });

  it('uses current AY outside overlap', () => {
    expect(getEffectiveSt2AcadYear('2025/2026', null, new Date(2025, 8, 1))).toBe('2025/2026');
  });
});

describe(isUsingPreviousAySt2Data, () => {
  it('returns true only during overlap', () => {
    expect(isUsingPreviousAySt2Data('2025/2026', null, new Date(2025, 6, 1))).toBe(true);
    expect(isUsingPreviousAySt2Data('2025/2026', null, new Date(2025, 8, 1))).toBe(false);
  });
});

describe(getPreviousAyShortName, () => {
  it('returns short name for effective ST II AY', () => {
    expect(getPreviousAyShortName('2025/2026', null, new Date(2025, 6, 1))).toBe('24/25');
  });
});

describe(mergePreviousAySt2Data, () => {
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

  it('merges ST II data from archive when current module lacks it', () => {
    const currentModule = {
      ...CS1010S,
      semesterData: CS1010S.semesterData.filter((semester) => semester.semester !== 4),
    } as unknown as Module;
    const archiveModule = {
      ...CS1010S,
      semesterData: [st2SemesterData],
    } as unknown as Module;

    const merged = mergePreviousAySt2Data(currentModule, archiveModule);
    expect(merged.semesterData.find((semester) => semester.semester === 4)).toEqual(
      st2SemesterData,
    );
  });

  it('returns current module unchanged when archive has no ST II data', () => {
    const currentModule = CS1010S as unknown as Module;
    const archiveModule = {
      ...CS1010S,
      semesterData: CS1010S.semesterData.filter((semester) => semester.semester !== 4),
    } as unknown as Module;

    expect(mergePreviousAySt2Data(currentModule, archiveModule)).toBe(currentModule);
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
