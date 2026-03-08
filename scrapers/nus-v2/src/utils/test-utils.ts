import type { Mocked } from 'vitest';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { omit, sortBy, zip } from 'lodash';
import httpStatus from 'http-status';

import { Cache } from '../types/persist';
import { Module, RawLesson, SemesterData, Weeks } from '../types/modules';
import { Logger } from '../services/logger';

export const EVERY_WEEK: Weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function mockCache<T>(fileContent: T): Mocked<Cache<T>> {
  // Annotating this as Cache<T> lets us make sure this function implements the interface
  const cache: Cache<T> = {
    path: './fake',
    read: vi.fn().mockResolvedValue(fileContent),
    write: vi.fn().mockResolvedValue(undefined),
  };

  // Returning this as Mocked<Cache<T>> allows us to access .mock* functions
  return cache as any;
}

export function mockLogger(): Logger {
  return {
    // Mock all logged functions
    debug: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    info: vi.fn(),
    trace: vi.fn(),
    warn: vi.fn(),

    // Calling child simply creates another mock logger
    child: mockLogger,
  };
}

/**
 * Check the two objects have the same properties
 */
export function expectSameKeys<T extends Record<string, never>>(actual: T, expected: T) {
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
}

export function serializeLesson(lesson: RawLesson) {
  return [
    lesson.lessonType,
    lesson.classNo,
    lesson.startTime,
    lesson.weeks,
    lesson.day,
    lesson.venue,
  ].join('|');
}

/**
 * Check that two timetables are the same
 */
export function expectLessonsEqual(actual: Array<RawLesson>, expected: Array<RawLesson>) {
  // Sort both expected and actual lessons because Jest expects
  // array to be in the same order
  expect(sortBy(actual, serializeLesson)).toEqual(sortBy(expected, serializeLesson));
}

function expectHistoryEqual(actual: Array<SemesterData>, expected: Array<SemesterData>) {
  zip(
    sortBy(actual, (semester) => semester.semester),
    sortBy(expected, (semester) => semester.semester),
  ).forEach(([actualSemester, expectedSemester]) => {
    if (!actualSemester || !expectedSemester) {
      throw new Error('Length of semesters not equal');
    }

    expect(omit(actualSemester, 'timetable')).toEqual(omit(expectedSemester, 'timetable'));

    expectLessonsEqual(actualSemester.timetable, expectedSemester.timetable);
  });
}

export function expectModulesEqual(actual: Module, expected: Module) {
  // FulfillRequirements is excluded because the modules that require CS2100 are not part of this test
  const omittedKeys = ['semesterData', 'fulfillRequirements', 'aliases', 'attributes'];
  expect(omit(actual, omittedKeys)).toEqual(omit(expected, omittedKeys));

  // Sort semesters and check history
  expectHistoryEqual(actual.semesterData, expected.semesterData);
}

/**
 * Mock an Axios response object
 */
export function mockResponse<T>(
  data: T,
  additionalFields: {
    config?: Partial<AxiosRequestConfig>;
    headers?: { [name: string]: string };
    request?: any;
    status?: number;
    statusText?: string;
  } = {},
): AxiosResponse<T> {
  const { config, headers, request, status, statusText } = additionalFields;

  return {
    data,
    // The server almost always returns 200, even if there is an application error
    status: status || 200,
    // Mildly horrifying coercions to make this at least somewhat readable
    config: config || {},
    headers: headers || {},
    request: request || {},
    statusText: statusText || (httpStatus as any)[status!] || 'OK',
  };
}

/**
 * Helper to easily create sets less verbosely
 */
export function s<T>(...args: Array<T>): Set<T> {
  return new Set(args);
}
