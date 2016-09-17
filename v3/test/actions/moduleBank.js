import test from 'ava';
import * as actions from 'actions/moduleBank';

test('fetchModuleList should dispatch a request', (t) => {
  t.true(typeof actions.fetchModuleList() === 'function');
});

test('fetchModule should dispatch a request', (t) => {
  t.true(typeof actions.fetchModule() === 'function');
});

test('loadModule should dispatch a request', (t) => {
  t.true(typeof actions.loadModule('test') === 'function');
});
