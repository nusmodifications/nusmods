import React from 'react';
import { displayPageRange } from './ModuleFinderPager';

describe(displayPageRange, () => {
  test('calculate page range correctly', () => {
    // One page
    expect(displayPageRange(1, 1, 5)).toEqual({ firstPageNum: 1, lastPageNum: 1 });

    // Fewer pages than requested num of display pages
    expect(displayPageRange(1, 2, 5)).toEqual({ firstPageNum: 1, lastPageNum: 2 });

    // Middle of range
    expect(displayPageRange(500, 1000, 5)).toEqual({ firstPageNum: 498, lastPageNum: 502 });

    // At start of range - should display requested num of display pages
    expect(displayPageRange(1, 100000, 5)).toEqual({ firstPageNum: 1, lastPageNum: 5 });
    expect(displayPageRange(2, 100000, 5)).toEqual({ firstPageNum: 1, lastPageNum: 5 });

    // At end of range - should display half of requested num of display pages
    expect(displayPageRange(10000, 10000, 5)).toEqual({ firstPageNum: 9998, lastPageNum: 10000 });
    expect(displayPageRange(9999, 10000, 5)).toEqual({ firstPageNum: 9997, lastPageNum: 10000 });

    // Even num display pages
    expect(displayPageRange(10, 50, 6)).toEqual({ firstPageNum: 7, lastPageNum: 12 });
  });

  test('edge cases', () => {
    expect(displayPageRange(1, 1, 0)).toBeFalsy();
    expect(displayPageRange(1, 0, 1)).toBeFalsy();
    expect(displayPageRange(0, 1, 1)).toBeFalsy(); // Page nums should always start at 1
  });
});
