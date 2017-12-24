// @flow
import localforage from 'localforage';
import type { ModuleCode, Semester, Lesson } from 'types/modules';
import lessons from '__mocks__/lessons-array.json';
import { nextTick } from 'test-utils/async';
import { TIMETABLE_MIGRATION_COMPLETE } from './settings';
import * as actions from './timetables';

jest.mock('localforage');

// see: https://github.com/reactjs/redux/blob/master/docs/recipes/WritingTests.md#example-1
// TODO: write addModule test with nock and mockStore.
test('addModule should create an action to add a module', () => {
  const moduleCode: ModuleCode = 'CS1010';
  const semester: Semester = 1;

  const value: Function = actions.addModule(semester, moduleCode);
  // TODO
  expect(typeof value === 'function').toBe(true);
});

test('removeLesson should return information to remove module', () => {
  const semester: Semester = 1;
  const moduleCode: ModuleCode = 'CS1010';
  expect(actions.removeModule(semester, moduleCode)).toMatchSnapshot();
});

test('modifyLesson should return lesson payload', () => {
  const activeLesson: Lesson = lessons[0];
  expect(actions.modifyLesson(activeLesson)).toMatchSnapshot();
});

test('changeLesson should return updated information to change lesson', () => {
  const semester: Semester = 1;
  const lesson: Lesson = lessons[1];
  expect(actions.changeLesson(semester, lesson)).toMatchSnapshot();
});

test('cancelModifyLesson should not have payload', () => {
  expect(actions.cancelModifyLesson()).toMatchSnapshot();
});

describe('migrateTimetable()', () => {
  const action = actions.migrateTimetable();
  const dispatch = jest.fn().mockReturnValue(Promise.resolve());
  const state = { settings: { isV2TimetableMigrated: false } };

  afterEach(() => {
    dispatch.mockReset();
  });

  test('not migrate if the timetable has already been migrated', async () => {
    action(dispatch, () => ({ settings: { isV2TimetableMigrated: true } }));
    await nextTick();

    expect(localforage.getItem).not.toHaveBeenCalled();
  });

  test('not migrate if old data is not present', async () => {
    localforage.getItem = jest.fn(() => Promise.resolve());
    action(dispatch, () => state);
    await nextTick();

    expect(dispatch).toHaveBeenCalledTimes(1);

    const [[dispatchedAction]] = dispatch.mock.calls;
    expect(dispatchedAction).toHaveProperty('type', TIMETABLE_MIGRATION_COMPLETE);
  });

  test('to migrate timetable', async () => {
    // Just mock one semester
    localforage.getItem = jest.fn((key) => {
      if (key.includes('sem1')) return Promise.resolve('CS5331=');
      return Promise.resolve();
    });

    action(dispatch, () => state);
    await nextTick();

    expect(dispatch).toHaveBeenCalledTimes(3);

    const [[firstAction], [secondAction], [thirdAction]] = dispatch.mock.calls;

    expect(firstAction).toHaveProperty('type', actions.SET_TIMETABLE);
    expect(secondAction).toBeInstanceOf(Function);
    expect(thirdAction).toHaveProperty('type', TIMETABLE_MIGRATION_COMPLETE);
  });
});
