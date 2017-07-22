// @flow
import * as actions from 'actions/helpers';

test('resetRequestState should by default return an array', () => {
  expect(actions.resetRequestState([])).toMatchSnapshot();
});

test('resetRequestState should convert item to an array', () => {
  expect(actions.resetRequestState('test')).toMatchSnapshot();
});

test('resetErrorState should by default return an array', () => {
  expect(actions.resetErrorState([])).toMatchSnapshot();
});

test('resetErrorState should convert item to an array', () => {
  expect(actions.resetErrorState('test')).toMatchSnapshot();
});

test('resetAllState should reset state', () => {
  expect(actions.resetAllState()).toMatchSnapshot();
});
