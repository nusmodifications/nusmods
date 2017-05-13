// @flow
import type { FSA } from 'types/redux';

import * as actions from 'actions/moduleBank';

test('fetchModuleList should return a request action', () => {
  const resultOfAction: FSA = actions.fetchModuleList();
  expect(resultOfAction).toMatchSnapshot();
});

test('fetchModule should return a request action', () => {
  const resultOfAction: FSA = actions.fetchModule('CS1010S');
  expect(resultOfAction).toMatchSnapshot();
});

// TODO: Find out how to test this using snapshots
test('loadModule should dispatch a request', () => {
  expect(typeof actions.loadModule('test') === 'function').toBe(true);
});
