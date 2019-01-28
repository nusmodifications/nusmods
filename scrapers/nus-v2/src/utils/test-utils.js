// @flow

/* eslint-env jest */

import { omit, sortBy, zip } from "lodash";
import type { Cache } from "../services/output";
import type { Module, RawLesson, SemesterData } from "../types/modules";

/* eslint-disable import/prefer-default-export */

export function mockCache<T>(fileContent: T): Cache<T> {
  return {
    path: './fake',
    write: jest.fn().mockResolvedValue(),
    read: jest.fn().mockResolvedValue(fileContent),
  };
}

/**
 * Check the two objects have the same properties
 */
export function expectSameKeys<T: Object>(actual: T, expected: T) {
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
}

export function serializeLesson(lesson: RawLesson) {
  return [
    lesson.LessonType,
    lesson.ClassNo,
    lesson.StartTime,
    lesson.WeekText,
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
    sortBy(expected, (semester) => semester.Semester)
  ).forEach(([actualSemester, expectedSemester]) => {
    expect(omit(actualSemester, "Timetable")).toEqual(omit(expectedSemester, "Timetable"));

    expectLessonsEqual(actualSemester.Timetable, expectedSemester.Timetable);
  });
}

export function expectModulesEqual(actual: Module, expected: Module) {
  // LockedModules is excluded because the modules that require CS2100 are not part of this test
  const omittedKeys = ["History", "LockedModules"];
  expect(omit(actual, omittedKeys)).toEqual(omit(expected, omittedKeys));

  // Sort semesters and check history
  expectHistoryEqual(actual.History, expected.History);
}
