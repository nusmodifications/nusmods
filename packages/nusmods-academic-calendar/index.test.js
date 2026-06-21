import { describe, expect, it } from 'vitest';

import {
  getEffectiveSpecialTermAcadYear,
  isPreviousAySpecialTermActive,
  isUsingPreviousAySpecialTermData,
  shouldUsePreviousAyForSemester,
} from './index.js';

// Refer to packages/nusmods-academic-calendar/academic-calendar.json each AY's configs.

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

describe(shouldUsePreviousAyForSemester, () => {
  it('returns true for special term semesters during overlap', () => {
    expect(shouldUsePreviousAyForSemester(3, '2025/2026', null, new Date(2025, 4, 15))).toBe(true);
    expect(shouldUsePreviousAyForSemester(4, '2025/2026', null, new Date(2025, 6, 1))).toBe(true);
  });

  it('returns false for normal semesters during overlap', () => {
    expect(shouldUsePreviousAyForSemester(1, '2025/2026', null, new Date(2025, 6, 1))).toBe(false);
    expect(shouldUsePreviousAyForSemester(2, '2025/2026', null, new Date(2025, 6, 1))).toBe(false);
  });
});
