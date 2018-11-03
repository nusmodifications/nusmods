// @flow
import type { FSA } from 'types/redux';
import type { TimetableConfig } from 'types/timetables';

import * as actions from 'actions/moduleBank';
import NUSModsApi from 'apis/nusmods';

// Mock NUSModsApi as its URLs contain the current AY, breaking the snapshot tests
// every AY.
jest.mock('apis/nusmods');
NUSModsApi.moduleListUrl.mockReturnValue('test://MOCK_MOD_LIST_URL');
NUSModsApi.moduleDetailsUrl.mockImplementation(
  (...args) => `test://MOCK_MOD_DETAILS_URL/${[...args].join('/')}`,
);

test('fetchModuleList should return a request action', () => {
  const resultOfAction: FSA = actions.fetchModuleList();
  expect(resultOfAction).toMatchSnapshot();
});

test('fetchModule should return a thunk', () => {
  const resultOfAction = actions.fetchModule('CS1010S');
  expect(resultOfAction).toMatchSnapshot();
});

test('getLRUModule should return the LRU and non-timetable module', () => {
  /* eslint-disable no-useless-computed-key */
  const timetableConfig: TimetableConfig = {
    [1]: {
      ACC1001: ({}: any),
    },
  };
  /* eslint-enable */
  const modules = {
    ACC1001: ({ timestamp: 1 }: any),
    ACC1002: ({ timestamp: 2 }: any),
    ACC1003: ({ timestamp: 3 }: any),
    ACC1004: ({ timestamp: 4 }: any),
  };
  const currentModule = 'ACC1002';
  const resultOfAction = actions.getLRUModule(modules, timetableConfig, currentModule);
  expect(resultOfAction).toMatchSnapshot();
});
