// @flow
import type { FSA } from 'types/redux';

import test from 'ava';
import * as actions from 'actions/moduleBank';

// TODO: Change to generated snapshot when migrated to Jest.
test('fetchModuleList should return a request action', (t) => {
  const resultOfAction: FSA = actions.fetchModuleList();
  t.is(resultOfAction.type, actions.FETCH_MODULE_LIST);
});

test('fetchModule should return a request action', (t) => {
  const resultOfAction: FSA = actions.fetchModule('CS1010S');
  t.is(resultOfAction.type, actions.FETCH_MODULE);
});

test('loadModule should dispatch a request', (t) => {
  t.true(typeof actions.loadModule('test') === 'function');
});
