// @flow
import localforage from 'localforage';
import type { ModuleCode, Semester, Lesson } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';

import lessons from '__mocks__/lessons-array.json';

/** @var {Module} */
import CS1010S from '__mocks__/modules/CS1010S.json';
/** @var {Module} */
import CS3216 from '__mocks__/modules/CS3216.json';

import runThunk from 'test-utils/runThunk';
import { V2_MIGRATION_KEY } from 'storage/keys';
import * as actions from './timetables';
import { FETCH_MODULE } from './moduleBank';

// Workaround for Jest not being able to recognize implicitly mocked modules
const storage = (require('storage'): any); // eslint-disable-line global-require

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

test('select module color should dispatch a select of module color', () => {
  const semester: Semester = 1;
  expect(actions.selectModuleColor(semester, 'CS1010S', 0)).toMatchSnapshot();
  expect(actions.selectModuleColor(semester, 'CS3216', 1)).toMatchSnapshot();
});

describe('migrateTimetable()', () => {
  const action = actions.migrateTimetable();
  const getState = () => ({
    moduleBank: { moduleCodes: { CS5331: {} }, modules: {} },
    timetables: { timetableConfig: {} },
  });
  const makeDispatch = () => jest.fn().mockReturnValue(Promise.resolve());

  afterEach(() => {
    storage.setItem.mockReset();
  });

  test('not migrate if the timetable has already been migrated', async () => {
    const dispatch = makeDispatch();
    storage.getItem.mockReturnValue(true);

    await runThunk(action, dispatch, getState);

    expect(localforage.getItem).not.toHaveBeenCalled();
  });

  test('not migrate if old data is not present', async () => {
    const dispatch = makeDispatch();

    storage.getItem.mockReturnValue();
    localforage.getItem.mockReturnValue(Promise.resolve());
    await runThunk(action, dispatch, getState);

    expect(dispatch).not.toHaveBeenCalled();
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(V2_MIGRATION_KEY, true);
  });

  test('to migrate timetable', async () => {
    const dispatch = makeDispatch();
    storage.getItem.mockReturnValue();
    // Just mock one semester
    localforage.getItem.mockImplementation((key) => {
      if (key.includes('sem1')) return Promise.resolve('CS5331=');
      return Promise.resolve();
    });

    await runThunk(action, dispatch, getState);
    expect(dispatch).toHaveBeenCalledTimes(2);

    const [[firstAction], [secondAction]] = dispatch.mock.calls;
    expect(firstAction).toHaveProperty('type', actions.SET_TIMETABLE);
    expect(secondAction).toHaveProperty('type', FETCH_MODULE);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(V2_MIGRATION_KEY, true);
  });

  test('to exclude invalid modules from timetable', async () => {
    const dispatch = makeDispatch();
    storage.getItem.mockReturnValue();
    // Just mock one semester
    localforage.getItem.mockImplementation((key) => {
      if (key.includes('sem1')) return Promise.resolve('CS5331=&DEADBEEF=');
      return Promise.resolve();
    });

    await runThunk(action, dispatch, getState);
    expect(dispatch).toHaveBeenCalledTimes(2);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(V2_MIGRATION_KEY, true);
  });
});

describe('fillTimetableBlanks', () => {
  const moduleBank = { modules: { CS1010S, CS3216 } };
  const timetablesState = (semester: Semester, timetable: SemTimetableConfig) => ({
    timetableConfig: { [semester]: timetable },
  });
  const semester = 1;
  const action = actions.fillTimetableBlanks(semester);

  test('do nothing if timetable is already full', () => {
    const timetable = {
      CS1010S: {
        Lecture: '1',
        Tutorial: '1',
        Recitation: '1',
      },
    };

    const state: any = { timetables: timetablesState(semester, timetable), moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);

    expect(dispatch).not.toHaveBeenCalled();
  });

  test('fill missing lessons with randomly generated modules', () => {
    const timetable = {
      CS1010S: {
        Lecture: '1',
        Tutorial: '1',
      },
      CS3216: {},
    };
    const state: any = { timetables: timetablesState(semester, timetable), moduleBank };
    const dispatch = jest.fn();

    action(dispatch, () => state);

    expect(dispatch).toHaveBeenCalledTimes(2);

    const [[firstAction], [secondAction]] = dispatch.mock.calls;
    expect(firstAction).toMatchObject({
      type: actions.CHANGE_LESSON,
      payload: {
        semester,
        moduleCode: 'CS1010S',
        lessonType: 'Recitation',
        classNo: expect.any(String),
      },
    });

    expect(secondAction).toMatchObject({
      type: actions.CHANGE_LESSON,
      payload: {
        semester,
        moduleCode: 'CS3216',
        lessonType: 'Lecture',
        classNo: '1',
      },
    });
  });
});
