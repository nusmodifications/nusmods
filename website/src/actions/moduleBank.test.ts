import _ from 'lodash';

import { TimetableConfig } from 'types/timetables';
import * as actions from 'actions/moduleBank';
import NUSModsApi from 'apis/nusmods';
import { getLRUModules } from './moduleBank-lru';

// Mock NUSModsApi as its URLs contain the current AY, breaking the snapshot tests
// every AY.
jest.mock('apis/nusmods');
const mockApi: jest.Mocked<typeof NUSModsApi> = NUSModsApi as any;
mockApi.moduleListUrl.mockReturnValue('test://MOCK_MOD_LIST_URL');
mockApi.moduleDetailsUrl.mockImplementation(
  (...args) => `test://MOCK_MOD_DETAILS_URL/${args.join('/')}`,
);

test('fetchModuleList should return a request action', () => {
  const resultOfAction = actions.fetchModuleList();
  expect(resultOfAction).toMatchSnapshot();
});

describe(actions.fetchModule, () => {
  test('should return a thunk', async () => {
    const thunk = actions.fetchModule('CS1010S');
    expect(thunk).toBeInstanceOf(Function);

    const dispatch = jest.fn().mockResolvedValue(undefined);
    const getState = jest.fn().mockReturnValue({
      moduleBank: { modules: { CS1010S: {} } },
    } as any);

    await thunk(dispatch, getState);

    expect(dispatch.mock.calls).toMatchSnapshot();
  });

  test('should remove LRU modules above limit', async () => {
    const thunk = actions.fetchModule('CS1010S');

    const modules: any = {};
    _.range(105).forEach((i) => {
      modules[`CS${i}`] = { timestamp: i };
    });

    const dispatch = jest.fn().mockResolvedValue(undefined);
    const getState = jest.fn().mockReturnValue({
      moduleBank: { modules },
      timetables: {},
    } as any);

    await thunk(dispatch, getState);

    expect(dispatch.mock.calls).toMatchSnapshot();
  });

  test('should rethrow errors', async () => {
    const thunk = actions.fetchModule('CS1010S');

    const error = new Error('ModuleBank Test: Error loading module');
    const dispatch = jest.fn().mockRejectedValue(error);
    const getState = jest.fn().mockReturnValue({
      moduleBank: { modules: { CS1010S: {} } },
    } as any);

    // This line causes an uncaught promise exception, even though it should
    // be caught. Not sure why.
    await expect(thunk(dispatch, getState)).rejects.toThrowError(error);
  });
});

test('getLRUModule should return the LRU and non-timetable module', () => {
  /* eslint-disable no-useless-computed-key */
  const timetableConfig: TimetableConfig = {
    [1]: {
      ACC1001: {} as any,
    },
  };
  /* eslint-enable */
  const modules: any = {
    ACC1001: { timestamp: 1 },
    ACC1002: { timestamp: 2 },
    ACC1003: { timestamp: 3 }, // To be deleted
    ACC1004: { timestamp: 4 },
  };

  const currentModule = 'ACC1002';
  const resultOfAction = getLRUModules(modules, timetableConfig, currentModule);
  expect(resultOfAction).toMatchSnapshot();
});

test('removeLRUModule should return an action', () => {
  const resultOfAction = actions.Internal.removeLRUModule(['ACC1001']);
  expect(resultOfAction).toMatchSnapshot();
});

test('updateModuleTimestamp should return an action', () => {
  const resultOfAction = actions.Internal.updateModuleTimestamp('ACC1001');
  expect(resultOfAction).toMatchSnapshot();
});

test('fetchModuleArchive should return a request action', () => {
  expect(actions.fetchModuleArchive('CS1010S', '2016/2017')).toMatchSnapshot();
});

test('fetchAllModuleArchive should return multiple request actions', () => {
  const dispatch = jest.fn().mockReturnValue(Promise.resolve());
  const thunk = actions.fetchAllModuleArchive('CS1010S');
  expect(thunk).toEqual(expect.any(Function));
  thunk(dispatch);
  expect(dispatch.mock.calls).toMatchSnapshot();
});
