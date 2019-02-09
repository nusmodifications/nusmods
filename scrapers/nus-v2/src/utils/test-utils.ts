import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { omit, sortBy, zip } from 'lodash';
import httpStatus from 'http-status';

import { Cache } from '../services/io';
import { Module, RawLesson, SemesterData } from '../types/modules';
import { Logger } from '../services/logger';

/* eslint-disable import/prefer-default-export */

export function mockCache<T>(fileContent: T): jest.Mocked<Cache<T>> {
  const cache: any = {
    path: './fake',
    write: jest.fn().mockResolvedValue(undefined),
    read: jest.fn().mockResolvedValue(fileContent),
  };

  return cache;
}

export function mockLogger(): Logger {
  const logger: any = {
    // Mock all logged functions
    critical: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),

    // Calling child simply creates another mock logger
    child: mockLogger,
  };

  return logger;
}

/**
 * Check the two objects have the same properties
 */
export function expectSameKeys<T>(actual: T, expected: T) {
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
}

export function serializeLesson(lesson: RawLesson) {
  return [
    lesson.LessonType,
    lesson.ClassNo,
    lesson.StartTime,
    lesson.Weeks.join('/'),
    lesson.DayText,
    lesson.Venue,
  ].join('|');
}

/**
 * Check that two timetables are the same
 */
export function expectLessonsEqual(actual: RawLesson[], expected: RawLesson[]) {
  // Sort both expected and actual lessons because Jest expects
  // array to be in the same order
  expect(sortBy(actual, serializeLesson)).toEqual(sortBy(expected, serializeLesson));
}

function expectHistoryEqual(actual: SemesterData[], expected: SemesterData[]) {
  zip(
    sortBy(actual, (semester) => semester.Semester),
    sortBy(expected, (semester) => semester.Semester),
  ).forEach(([actualSemester, expectedSemester]) => {
    expect(omit(actualSemester, 'Timetable')).toEqual(omit(expectedSemester, 'Timetable'));

    expectLessonsEqual(actualSemester.Timetable, expectedSemester.Timetable);
  });
}

export function expectModulesEqual(actual: Module, expected: Module) {
  // FulfillRequirements is excluded because the modules that require CS2100 are not part of this test
  const omittedKeys = ['SemesterData', 'FulfillRequirements'];
  expect(omit(actual, omittedKeys)).toEqual(omit(expected, omittedKeys));

  // Sort semesters and check history
  expectHistoryEqual(actual.SemesterData, expected.SemesterData);
}

/**
 * Mock an Axios response object
 */
export function mockResponse<T>(
  data: T,
  additionalFields: {
    headers?: { [name: string]: string };
    config?: Partial<AxiosRequestConfig>;
    request?: any;
    status?: number;
    statusText?: string;
  } = {},
): AxiosResponse<T> {
  const { headers, config, request, status, statusText } = additionalFields;
  const response: any = {
    data,
    // The server almost always returns 200, even if there is an application error
    status: status || 200,
    statusText: statusText || httpStatus[status] || 'OK',
    headers: headers || {},
    config: config || {},
    request: request || {},
  };

  return response;
}
