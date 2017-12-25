// @flow
import localforage from 'localforage';
import type { ModuleCode, Semester, Lesson } from 'types/modules';
import lessons from '__mocks__/lessons-array.json';
import storage from 'storage';
import * as actions from './timetables';

jest.mock('localforage', () => ({ getItem: jest.fn() }));
jest.mock('storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

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
  const migrationKey = 'v2Migration';
  const action = actions.migrateTimetable();
  const dispatch = jest.fn()
    .mockReturnValue(Promise.resolve());

  afterEach(() => {
    dispatch.mockReset();
    storage.setItem.mockReset();
  });

  test('not migrate if the timetable has already been migrated', async () => {
    storage.getItem.mockReturnValue(true);

    await action(dispatch);

    expect(localforage.getItem).not.toHaveBeenCalled();
  });

  test('not migrate if old data is not present', async () => {
    storage.getItem.mockReturnValue();
    localforage.getItem.mockReturnValue(Promise.resolve());
    await action(dispatch);

    expect(dispatch).not.toHaveBeenCalled();
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(migrationKey, true);
  });

  test('to migrate timetable', async () => {
    storage.getItem.mockReturnValue();
    // Just mock one semester
    localforage.getItem.mockImplementation((key) => {
      if (key.includes('sem1')) return Promise.resolve('CS5331=');
      return Promise.resolve();
    });

    await action(dispatch);

    expect(dispatch).toHaveBeenCalledTimes(2);

    const [[firstAction], [secondAction]] = dispatch.mock.calls;
    expect(firstAction).toHaveProperty('type', actions.SET_TIMETABLE);
    expect(secondAction).toBeInstanceOf(Function);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(migrationKey, true);
  });
});
