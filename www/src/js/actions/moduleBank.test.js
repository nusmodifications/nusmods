// @flow

import _ from 'lodash';

import type { TimetableConfig } from 'types/timetables';
import * as actions from 'actions/moduleBank';
import NUSModsApi from 'apis/nusmods';
import { waitFor } from 'test-utils/async';

// Mock NUSModsApi as its URLs contain the current AY, breaking the snapshot tests
// every AY.
jest.mock('apis/nusmods');
NUSModsApi.moduleListUrl.mockReturnValue('test://MOCK_MOD_LIST_URL');
NUSModsApi.moduleDetailsUrl.mockImplementation(
  (...args) => `test://MOCK_MOD_DETAILS_URL/${args.join('/')}`,
);

test('fetchModuleList should return a request action', () => {
  const resultOfAction = actions.fetchModuleList();
  expect(resultOfAction).toMatchSnapshot();
});

test('fetchModule should return a thunk', async () => {
  const thunk = actions.fetchModule('CS1010S');
  expect(thunk).toBeInstanceOf(Function);

  const dispatch = jest.fn().mockResolvedValue();
  const getState = jest.fn().mockReturnValue(
    ({
      moduleBank: { modules: { CS1010S: {} } },
    }: any),
  );

  thunk(dispatch, getState);

  await waitFor(() => getState.mock.calls.length > 0);

  expect(dispatch.mock.calls).toMatchSnapshot();
});

test('fetchModule should remove LRU modules above limit', async () => {
  const thunk = actions.fetchModule('CS1010S');

  const modules = {};
  _.range(105).forEach((i) => {
    modules[`CS${i}`] = { timestamp: i };
  });

  const dispatch = jest.fn().mockResolvedValue();
  const getState = jest.fn().mockReturnValue(
    ({
      moduleBank: { modules },
      timetables: {},
    }: any),
  );

  thunk(dispatch, getState);

  await waitFor(() => getState.mock.calls.length > 0);

  expect(dispatch.mock.calls).toMatchSnapshot();
});

test('getLRUModule should return the LRU and non-timetable module', () => {
  /* eslint-disable no-useless-computed-key */
  const timetableConfig: TimetableConfig = {
    [1]: {
      ACC1001: ({}: any),
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
  const resultOfAction = actions.getLRUModules(modules, timetableConfig, currentModule);
  expect(resultOfAction).toMatchSnapshot();
});

test('removeLRUModule should return an action', () => {
  const resultOfAction = actions.removeLRUModule(['ACC1001']);
  expect(resultOfAction).toMatchSnapshot();
});

test('updateModuleTimestamp should return an action', () => {
  const resultOfAction = actions.updateModuleTimestamp('ACC1001');
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
