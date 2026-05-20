import { describe, expect, it } from 'vitest';

import {
  getEffectiveSt2AcadYear,
  isPreviousAySt2Active,
  isUsingPreviousAySt2Data,
} from './index.js';

describe(isPreviousAySt2Active, () => {
  it('returns true during the ST II overlap after AY migration', () => {
    expect(isPreviousAySt2Active('2025/2026', new Date(2025, 6, 1))).toBe(true);
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
});

describe(isUsingPreviousAySt2Data, () => {
  it('returns true only during overlap', () => {
    expect(isUsingPreviousAySt2Data('2025/2026', null, new Date(2025, 6, 1))).toBe(true);
    expect(isUsingPreviousAySt2Data('2025/2026', null, new Date(2025, 8, 1))).toBe(false);
  });
});
